from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import csv
import sys
import re
import spacy
from spacy import displacy
from services import predict_topic, get_top_words, evaluate_summary
from transformers import PegasusForConditionalGeneration, PegasusTokenizer
import torch

# from gensim.corpora import Dictionary
# from gensim.models import LdaModel

import warnings
warnings.filterwarnings('ignore', category=UserWarning, module='transformers')

app = Flask(__name__)
CORS(app) 

# NER
ner_model_path = '../model_ner'
nlp = spacy.load(ner_model_path)

# Topic Modelling - LDA (deprecated)
# lda_model = LdaModel.load("../lda_model")
# dictionary = Dictionary.load("../corpus")

# Summary
model_name = 'google/pegasus-xsum'
torch_device = 'cuda' if torch.cuda.is_available() else 'cpu'
tokenizer = PegasusTokenizer.from_pretrained(model_name)
model = PegasusForConditionalGeneration.from_pretrained(model_name).to(torch_device)

@app.route('/api/unique-url-ids', methods=['GET'])
def get_documents_url():
    csv_file_path = '../sectionized_data.csv'
    documents_data = {}

    try:
        csv.field_size_limit(sys.maxsize)

        with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
            reader = csv.DictReader(csv_file)
            for row in reader:
                if 'URL_id' in row:
                    url = row['URL_id']
                    # Regex to capture year, court type, and case number
                    match = re.search(r'https://www.elitigation.sg/gd/s/(\d{4})_([A-Z]+)_(\d+)', url)
                    if match:
                        year, court_type, case_number = match.groups()
                        if year not in documents_data:
                            documents_data[year] = {}
                        if court_type not in documents_data[year]:
                            documents_data[year][court_type] = {}
                        documents_data[year][court_type][int(case_number)] = url

        # Sort by case number and convert dictionaries to lists of URLs
        for year in documents_data:
            for court_type in documents_data[year]:
                # Create a sorted list of URLs based on case numbers
                sorted_urls = [documents_data[year][court_type][key] for key in sorted(documents_data[year][court_type])]
                documents_data[year][court_type] = sorted_urls

        return jsonify(documents_data), 200
        
    except Exception as e:
        return jsonify(error=str(e)), 500

@app.route('/api/documents-by-url', methods=['GET'])
def get_documents():
    url_to_find = request.args.get('url')

    if not url_to_find:
        return jsonify({"error": "URL parameter is required"}), 400

    csv_file_path = '../sectionized_data.csv'

    try:
        csv.field_size_limit(sys.maxsize)
        matching_rows = {} 
        with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
            reader = csv.DictReader(csv_file)
            index = 0
            for row in reader:
                if row['URL_id'] == url_to_find:
                    if (len(row['Header']) > 0 or len(row['Body']) > 0):
                        matching_rows[index] = {
                            "header": row['Header'], 
                            "body": row['Body']
                        }
                        index += 1 
            
            if not matching_rows:
                return jsonify({"error": "URL not found"}), 404
            
            return jsonify(matching_rows), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/metadata-by-url', methods=['GET'])
def get_metadata():
    url_to_find = request.args.get('url')

    if not url_to_find:
        return jsonify({"error": "URL parameter is required"}), 400

    csv_file_path = '../legal_metadata_test.csv'

    try:
        csv.field_size_limit(sys.maxsize)
        metadata = {} 
        with open(csv_file_path, mode='r', encoding='utf-8') as csv_file:
            reader = csv.DictReader(csv_file)
            for row in reader:
                if row['URL'] == url_to_find:
                    metadata = {
                        "caseId": row['Case ID'], 
                        "url": row['URL'], 
                        "caseTitle": row['Case Title'],
                        "catchwords": row['Catchwords'],
                    }
            return jsonify(metadata), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/ner', methods=['POST'])
def ner():
    text = request.json.get('text')
    entityTypes = request.json.get('entitiesList')
    doc = nlp(text)
    colors = {
        "COURT": "#FFB6C1",
        "PETITIONER": "#FFDAB9",
        "RESPONDENT": "#FFA07A",
        "JUDGE": "#FFC0CB",
        "LAWYER": "#FFDEAD",
        "DATE": "#F0E68C",
        "ORGANIZATION": "#FF69B4",
        "GPE": "#20B2AA",
        "STATUE": "#87CEFA",
        "PRECEDENT": "#ADD8E6",
        "CASE_NUMBER": "#B0E0E6",
        "WITNESS": "#87CEEB",
        "OTHER_PERSON": "#AFEEEE"
    }

    options = {"ents": entityTypes, "colors": colors}

    html = displacy.render(doc, style='ent', page=True, options=options)
    response = make_response(html)
    response.headers['Content-Type'] = 'text/html'
    return response

# Using BERT-legal model
@app.route('/api/predicted-topic', methods=['POST'])
def get_predicted_topics():
    data = request.json
    # doc_header = data['header']
    doc_body = data['body']
    predicted_topic = predict_topic(doc_body)

    response = {
        "predicted_topic": predicted_topic,
    }
    return jsonify(response)


# Approach: Replicate sentences that contain the keywords from dominant topics
def adjust_text_based_on_topics(text, predicted_topic):
    # Get the document's topic distribution and top keywords for each topic
    topic_keywords = get_top_words(predicted_topic)

    # Adjust the text by emphasizing sentences with keywords
    adjusted_text = ""
    for sentence in text.split('. '):
        sentence_keywords = [word for word in topic_keywords if word in sentence]
        if sentence_keywords:
            # Duplicate sentences containing keywords from dominant topics
            adjusted_text += " " + sentence + ". " + sentence + ". "
        else:
            adjusted_text += " " + sentence + ". "
    
    return adjusted_text.strip()

# uses insights gained from the BERT model to guide the summarization process.
@app.route('/api/enhanced-summarise', methods=['POST'])
def enhanced_summarize_text():
    data = request.json
    doc_body = data.get('text')
    doc_body_length = len(doc_body.split(' '))
    desired_summary_length = max(40, min(doc_body_length // 2, 300))

    predicted_topic = predict_topic(doc_body)

    adjusted_text = doc_body

    if predicted_topic:
        adjusted_text = adjust_text_based_on_topics(doc_body, predicted_topic)

    batch = tokenizer(adjusted_text, truncation=True, padding='longest', max_length=512, return_tensors="pt").to(torch_device)
    
    # Generate summary with potentially adjusted parameters based on topics
    summary_ids = model.generate(batch['input_ids'], attention_mask=batch['attention_mask'],  max_length=desired_summary_length, 
        min_length=desired_summary_length // 2, length_penalty=2.0, num_beams=4, early_stopping=True)
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    
    evaluation = evaluate_summary(summary, doc_body)
    return jsonify({"summary": summary, "evaluation": evaluation})

# Summarise using Pegasus only 
@app.route('/api/summarise', methods=['POST'])
def summarize_text():
    # Extract text from the POST request
    data = request.json
    src_text = data.get('text')

    src_text_length = len(src_text.split(' '))
    desired_summary_length = max(40, min(src_text_length // 2, 300))  # Ensure within model's limits
    
    if not src_text:
        return jsonify({"error": "No text provided for summarization"}), 400
    
    # Prepare the text for the model
    batch = tokenizer(src_text, truncation=True, padding='longest', max_length=512, return_tensors="pt").to(torch_device)
    
    # Generate summary
    summary_ids = model.generate(batch['input_ids'], attention_mask=batch['attention_mask'], max_length=desired_summary_length, min_length=desired_summary_length // 2, length_penalty=2.0, num_beams=4, early_stopping=True)
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    evaluation = evaluate_summary(summary, src_text)
    
    return jsonify({"summary": summary, "evaluation": evaluation})

# Deprecated: Topic Modeling with LDA model
# @app.route('/api/document-topic-distribution', methods=['POST'])
# def get_document_topics_lda():
#     data = request.json
#     # doc_header = data['header']
#     doc_body = data['body']

#     tokens = preprocess(doc_body)

#     # Convert tokens to BOW format
#     bow_vector = [dictionary.doc2bow(tokens)]

#     # Perform inference using the loaded model
#     topic_distribution = lda_model.get_document_topics(bow_vector)

#     topic_distributions = list(topic_distribution)  # Convert the TransformedCorpus to a list

#     if topic_distributions:
#         single_doc_distribution = topic_distributions[0]
#         topics_json = [{topic_labels[topic_id]: float(prob)} for topic_id, prob in single_doc_distribution]

#         dominant_topic_id, dominant_prob = max(single_doc_distribution, key=lambda x: x[1])
#         dominant_topic_label = topic_labels[dominant_topic_id]
#         dominant_topic = {"Dominant Topic": dominant_topic_label, "Probability": float(dominant_prob)}

#         response = {
#             "topics": topics_json,
#             "dominant_topic": dominant_topic
#         }

#     return jsonify(response)
if __name__ == '__main__':
    app.run(debug=True)

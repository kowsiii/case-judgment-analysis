from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import csv
import sys
import re
import spacy
from spacy import displacy
from collections import OrderedDict
import json

from gensim.corpora import Dictionary
from gensim.models import LdaModel

from services import preprocess_text, summarise_text, evaluate_summary, preprocess

from transformers import PegasusForConditionalGeneration, PegasusTokenizer
import torch

import warnings
warnings.filterwarnings('ignore', category=UserWarning, module='transformers')

app = Flask(__name__)
CORS(app) 

# NER
ner_model_path = '../model_ner'
nlp = spacy.load(ner_model_path)
# nlp = spacy.load("en_core_web_sm")

# Topic Modelling
lda_model = LdaModel.load("./lda_model")
dictionary = Dictionary.load("./corpus")
topic_labels = [
    "Legal Agreement and Court Proceedings",
    "Audit Rights and Plaintiffs' Issues",
    "Court Decisions and Appeal Cases",
    "Enforcement Process and Court Decisions",
    "Appeals and Legal Applications",
    "Legal Proceedings and Sentencing",
    "Plaintiffs' Claims and Court Proceedings",
    "Rights of Defendants and Plaintiffs",
    "Defendant Claims and Vessel Issues",
    "Court Offences and Sentencing Issues"
]

# Summary
model_name = 'google/pegasus-xsum'
torch_device = 'cuda' if torch.cuda.is_available() else 'cpu'
tokenizer = PegasusTokenizer.from_pretrained(model_name)
model = PegasusForConditionalGeneration.from_pretrained(model_name).to(torch_device)


@app.route('/api/unique-url-ids', methods=['GET'])
def get_documents_url():
    csv_file_path = './sectionized_data.csv'
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
                        # Initialize nested dictionaries as needed
                        if year not in documents_data:
                            documents_data[year] = {}
                        if court_type not in documents_data[year]:
                            documents_data[year][court_type] = {}
                        # Store URL using case number as key to ensure uniqueness
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
    # Extract URL from query parameters
    url_to_find = request.args.get('url')

    if not url_to_find:
        return jsonify({"error": "URL parameter is required"}), 400

    csv_file_path = './sectionized_data.csv'

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
                # No matches found for the URL
                return jsonify({"error": "URL not found"}), 404
            
            # Return all matching rows as an object of objects
            return jsonify(matching_rows), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/metadata-by-url', methods=['GET'])
def get_metadata():
    # Extract URL from query parameters
    url_to_find = request.args.get('url')

    if not url_to_find:
        return jsonify({"error": "URL parameter is required"}), 400

    csv_file_path = './legal_metadata_test.csv'

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
    # Return the HTML content
    response = make_response(html)
    response.headers['Content-Type'] = 'text/html'
    return response

@app.route('/api/document-topic-distribution', methods=['POST'])
def get_document_topics():
    data = request.json
    # doc_header = data['header']
    doc_body = data['body']

    tokens = preprocess(doc_body)

    # Convert tokens to BOW format
    bow_vector = [dictionary.doc2bow(tokens)]

    # Perform inference using the loaded model
    topic_distribution = lda_model.get_document_topics(bow_vector)

    topic_distributions = list(topic_distribution)  # Convert the TransformedCorpus to a list

    if topic_distributions:
        single_doc_distribution = topic_distributions[0]
        topics_json = [{topic_labels[topic_id]: float(prob)} for topic_id, prob in single_doc_distribution]

        dominant_topic_id, dominant_prob = max(single_doc_distribution, key=lambda x: x[1])
        dominant_topic_label = topic_labels[dominant_topic_id]
        dominant_topic = {"Dominant Topic": dominant_topic_label, "Probability": float(dominant_prob)}

        response = {
            "topics": topics_json,
            "dominant_topic": dominant_topic
        }

    return jsonify(response)

@app.route('/api/summarise', methods=['POST'])
def summarize_text():
    # Extract text from the POST request
    data = request.json
    src_text = data.get('text')
    
    if not src_text:
        return jsonify({"error": "No text provided for summarization"}), 400
    
    # Prepare the text for the model
    batch = tokenizer(src_text, truncation=True, padding='longest', max_length=512, return_tensors="pt").to(torch_device)
    
    # Generate summary
    summary_ids = model.generate(batch['input_ids'], attention_mask=batch['attention_mask'], max_length=150, min_length=40, length_penalty=2.0, num_beams=4, early_stopping=True)
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    
    return jsonify({"summary": summary})


# old
@app.route('/summarize', methods=['POST'])
def summarize_document():
    # Check if there is a file in the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']

    # empty file without a filename.
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    document = file.read().decode('utf-8')
    preprocessed_paragraphs = preprocess_text(document)
    summaries, generated_summary = summarise_text(preprocessed_paragraphs)
    rouge_evaluation = evaluate_summary(generated_summary, preprocessed_paragraphs)

    return jsonify({'summary': summaries, 'evaluation': rouge_evaluation}), 200

if __name__ == '__main__':
    app.run(debug=True)

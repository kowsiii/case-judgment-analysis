from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import re
from rouge import Rouge

app = Flask(__name__)
CORS(app)  # Add this line to enable CORS for all routes

# Initialize the summarization pipeline
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

def preprocess_text(text):
    min_word_count = 50
    non_informative_keywords = ['Exhibit', 'EXECUTION COPY']
    
    paragraphs = text.split("\n\n")
    preprocessed_paragraphs = [" ".join(paragraph.replace("\t", " ").split()) for paragraph in paragraphs]
    filtered_paragraphs = [paragraph for paragraph in preprocessed_paragraphs
                           if not any(keyword in paragraph for keyword in non_informative_keywords)
                           and paragraph.strip() and len(paragraph.split()) >= min_word_count]
    return filtered_paragraphs

def condense_summary(summary):
    sentences = summary.split('. ')
    if len(sentences) > 1:
        return '. '.join(sentences[:-1])
    return summary

@app.route('/')
def test_hello():
    return 'hello world'

@app.route('/summarize', methods=['POST'])
def summarize_document():
    data = request.json
    if 'document' not in data:
        return jsonify({'error': 'No document uploaded'}), 400

    document = data['document']
    preprocessed_paragraphs = preprocess_text(document)

    summaries = []

    for paragraph in preprocessed_paragraphs:
        try:
            batch_summaries = summarizer(paragraph, max_length=70, min_length=30, do_sample=False)
            for summary in batch_summaries:
                condensed = condense_summary(summary['summary_text'])
                if condensed: 
                    summaries.append(condensed)
                summaries.append(condensed)
        except Exception as e:
            print(f"Error processing paragraph: {e}")
    
    generated_summary = " ".join(summaries)

    return jsonify({'summary': generated_summary}), 200

if __name__ == '__main__':
    app.run(debug=True)

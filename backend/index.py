from flask import Flask, request, jsonify
from flask_cors import CORS

from services import preprocess_text, summarise_text, evaluate_summary

app = Flask(__name__)
CORS(app) 

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

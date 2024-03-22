from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
from rouge import Rouge

app = Flask(__name__)
CORS(app) 

# Initialize the summarization pipeline
# summarizer = pipeline("summarization", model="facebook/bart-large-cnn") # this is bad..
summarizer = pipeline("summarization", model="sshleifer/distilbart-cnn-12-6")

min_word_count = 50

def preprocess_text(text):
    # Split text into paragraphs based on two or more newlines
    sections = text.split("\n\n")
    sections = [section.strip() for section in sections if section.strip()]
    sections = [section.replace('\xa0', ' ') for section in sections]
    # Normalize whitespace and strip spaces for each paragraph
    sections = [" ".join(section.replace("\t", " ").split()) for section in sections]
    return sections

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
    summaries = []
    generated_summary = []

    for i in range(0, len(preprocessed_paragraphs)):
        paragraph = preprocessed_paragraphs[i]
        word_count = len(paragraph.split())
        if word_count < min_word_count: 
            summaries.append({
                'original_text': paragraph
            })
        else:
            try:
                # input_length = len(paragraph.split())
                # max_length = max(30, int(input_length * 0.75))  # 75% of input length
                summary = summarizer(paragraph, min_length=30, do_sample=False) 
                summaries.append({
                    'original_text': preprocessed_paragraphs[i], 
                    'summarised_text': summary[0]['summary_text']
                })
                generated_summary.append(summary[0]['summary_text'])
            except Exception as e:
                print(f"Error processing index {i}: {e}")
                summaries.append({
                    'original_text': paragraph,
                    'error': str(e)
                })

    # Evaluate summarisation output
    reference_summary_str = " ".join(preprocessed_paragraphs)
    generated_summary_str = " ".join(generated_summary)
    
    rouge = Rouge()
    scores = rouge.get_scores(generated_summary_str, reference_summary_str)

    rouge_1 = scores[0]['rouge-1']
    rouge_2 = scores[0]['rouge-2']
    rouge_l = scores[0]['rouge-l']

    evaluation= {
        'rouge_1': {
            'recall': round(rouge_1['r'], 3),
            'precision': round(rouge_1['p'], 3),
            'f1_score': round(rouge_1['f'], 3)
        }, 
        'rouge_2': {
            'recall': round(rouge_2['r'], 3),
            'precision': round(rouge_2['p'], 3),
            'f1_score': round(rouge_2['f'], 3)
        }, 
        'rouge_l': {
            'recall': round(rouge_l['r'], 3),
            'precision': round(rouge_l['p'], 3),
            'f1_score': round(rouge_l['f'], 3)
        }, 
    }

    return jsonify({'summary': summaries, 'evaluation': evaluation}), 200

if __name__ == '__main__':
    app.run(debug=True)

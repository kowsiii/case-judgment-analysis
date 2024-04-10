from transformers import BertTokenizer, BertModel
import torch
import json
from gensim.utils import simple_preprocess
import joblib
import os

current_working_directory = os.getcwd()

# Topic Modelling - BERT-legal
BERT_MODEL_DIR = os.path.join(current_working_directory, '../BERTLegal')

# Load the tokenizer and the model
tokenizer = BertTokenizer.from_pretrained(BERT_MODEL_DIR)
model = BertModel.from_pretrained(BERT_MODEL_DIR)

optimal_num_topics=45
# Load the topic labels for BERT legal model
with open(f"{BERT_MODEL_DIR}/topic_labels.json", "r") as file:
    topic_labels = json.load(file)

with open(f"{BERT_MODEL_DIR}/words_distribution_with_topics.json", "r") as data_file:
    topics_data = json.load(data_file)

kmeans = joblib.load(f"{BERT_MODEL_DIR}/kmeans_model.pkl")


# Function to preprocess the text (similar to what was done during training)
def preprocess(text):
    text = text.lower()
    tokens = simple_preprocess(text, deacc=True)
    return tokens

# Function to predict the topic label for a new document
def predict_topic(new_document):
    # Preprocess the new document
    preprocessed_doc = preprocess(new_document)
   
    # Encode the document using the loaded tokenizer
    encoded_doc = tokenizer.encode(preprocessed_doc, add_special_tokens=True, max_length=512, truncation=True, padding='max_length', return_tensors='pt')

    # Compute BERT embeddings for the document
    with torch.no_grad():
        outputs = model(encoded_doc)
        pooled_output = outputs[1].numpy()

    # Use KMeans model to predict the topic label
    topic_label = kmeans.predict(pooled_output)[0]

    # Map the predicted label to the corresponding topic
    predicted_topic = topic_labels[f"Topic {topic_label}"]

    return predicted_topic

def get_top_words(topic, n=10):
    """
    Retrieves the top words for a given topic.

    Parameters:
    - topic (str): The topic for which to retrieve the top words.
    - n (int): Number of top words to retrieve. Defaults to 10.
    """
    if topic in topics_data:
        topic_dict = topics_data[topic]
        top_words = sorted(topic_dict.items(), key=lambda x: x[1], reverse=True)[:n]
        top_words_only = [word for word, prob in top_words]
        return top_words_only
    else:
        return ["Topic not found."]

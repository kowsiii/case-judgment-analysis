# DEPRECATED -- not in use
from gensim.utils import simple_preprocess
from nltk.corpus import stopwords
import string

# Preprocessing function
def preprocess(text):
    stop_words = set(stopwords.words('english'))
    text = text.lower()  # Convert text to lowercase
    text = text.translate(str.maketrans('', '', string.punctuation))  # Remove punctuation
    tokens = simple_preprocess(text, deacc=True)  # Tokenize and remove accents
    tokens = [token for token in tokens if token not in stop_words]  # Remove stopwords
    return tokens
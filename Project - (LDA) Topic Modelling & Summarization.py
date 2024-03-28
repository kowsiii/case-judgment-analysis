#!/usr/bin/env python
# coding: utf-8

# In[1]:


import pandas as pd
from gensim.models import LdaModel
from gensim.corpora import Dictionary
from gensim.utils import simple_preprocess
from nltk.corpus import stopwords
import string

# Load the CSV file
df = pd.read_csv("sectionized_data.csv")
df = df.dropna()

# Preprocessing function
def preprocess(text):
    stop_words = set(stopwords.words('english'))
    text = text.lower()  # Convert text to lowercase
    text = text.translate(str.maketrans('', '', string.punctuation))  # Remove punctuation
    tokens = simple_preprocess(text, deacc=True)  # Tokenize and remove accents
    tokens = [token for token in tokens if token not in stop_words]  # Remove stopwords
    return tokens

# Tokenize and preprocess the text
df['tokens'] = df['Body'].apply(preprocess)

# Create a dictionary representation of the documents
dictionary = Dictionary(df['tokens'])

# Filter out words that occur less than 10 documents, or more than 50% of the documents
#dictionary.filter_extremes(no_below=10, no_above=0.5)

# Bag-of-words representation of the documents
corpus = [dictionary.doc2bow(doc) for doc in df['tokens']]


# In[2]:


from gensim.models import CoherenceModel
import matplotlib.pyplot as plt

#Optimal K
# Define a range of candidate numbers of topics
min_topics = 2
max_topics = 50
step_size = 1
topics_range = range(min_topics, max_topics + 1, step_size)

# Initialize empty lists to store coherence scores
coherence_scores = []

# Iterate through different numbers of topics
for num_topics in topics_range:
    # Train LDA model
    lda_model = LdaModel(corpus=corpus, id2word=dictionary, num_topics=num_topics)
    
    # Calculate coherence score
    coherence_model = CoherenceModel(model=lda_model, texts=df['tokens'], dictionary=dictionary, coherence='c_v')
    coherence_score = coherence_model.get_coherence()
    
    # Append coherence score to the list
    coherence_scores.append(coherence_score)

# Plot the coherence scores
plt.figure(figsize=(10, 6))
plt.plot(topics_range, coherence_scores, marker='o', linestyle='-')
plt.xlabel("Number of Topics")
plt.ylabel("Coherence Score")
plt.title("Coherence Score vs. Number of Topics")
plt.xticks(topics_range)
plt.grid(True)
plt.show()


# In[6]:


# Train LDA model
num_topics = 10 # Change this number to set the number of topics
lda_model = LdaModel(corpus=corpus, id2word=dictionary, num_topics=num_topics)

# Print the topics
topics_dict = {}
Topics_Str = ''
for idx, topic in lda_model.print_topics():
    Topics_Str += "Topic {}: {}".format(idx, topic) +'\n'
    #print("Topic {}: {}".format(idx, topic)) 
print(Topics_Str)

#Use LLM model to label the topics manually (if the topics are not coherent then remove those topics)
#Label the topics during the training itself and save these topics in excel
#and when testing during demo display the dominant topic label

# Save the trained model
lda_model.save("lda_model")
dictionary.save("corpus")


# In[8]:


#Testing the loaded model 

from gensim.models import LdaModel
from gensim.corpora import Dictionary

# Load the saved LDA model
lda_model = LdaModel.load("lda_model")

# Load the saved dictionary
dictionary = Dictionary.load("corpus")

# Assuming you have preprocessed text documents stored in a variable called "new_documents"
# Tokenize and preprocess the new documents
new_corpus = [dictionary.doc2bow(preprocess(doc)) for doc in df['Body']]

# Perform inference using the loaded model
for doc in new_corpus:
    topics = lda_model[doc]  # Get the topic distribution for each document
    print(topics)


# In[5]:


# Initialize an empty dictionary
topics_dict = {}

# Split the string by lines
lines = Topics_Str.strip().split('\n')

# Iterate over each line and extract topic number and terms
for line in lines:
    # Split line by ':'
    parts = line.split(':')
    # Get topic number
    topic_num = parts[0].strip()
    # Get terms and probabilities
    terms_probs = parts[1].strip().split(' + ')
    # Extract terms and probabilities
    topic_terms = {}
    for term_prob in terms_probs:
        prob, term = term_prob.split('*')
        topic_terms[term.strip().strip('"')] = float(prob)
    # Add topic to dictionary
    topics_dict[topic_num] = topic_terms

# Print the dictionary
print(topics_dict)


# In[7]:


import pandas as pd

# Provided topic labels based on Chatgpt

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

# Replace keys with topic labels
labeled_topics_dict = {topic_labels[i]: v for i, (k, v) in enumerate(topics_dict.items())}
print(labeled_topics_dict)

# Convert the dictionary to a DataFrame
# df = pd.DataFrame(labeled_topics_dict).T.reset_index().rename(columns={'index': 'Topic'})
# df = df.melt(id_vars=['Topic'], var_name='Word', value_name='Probability')
# print(df.head(10))
# # Save the DataFrame to an Excel file
# df.to_excel("topic_word_probabilities.xlsx", index=False)


# In[8]:


import matplotlib.pyplot as plt

# Get topic distribution for each document
topic_distribution = [lda_model.get_document_topics(doc) for doc in corpus]

# Initialize an empty list to store topic probabilities for each document
topic_probabilities = [[] for _ in range(num_topics)]

# Populate the topic probabilities list
for doc_topics in topic_distribution:
    for topic, prob in doc_topics:
        topic_probabilities[topic].append(prob)

# Plotting
plt.figure(figsize=(10, 6))
for i, topic_probs in enumerate(topic_probabilities):
    plt.hist(topic_probs, bins=20, alpha=0.5, label='Topic {}'.format(i))

plt.xlabel('Probability')
plt.ylabel('Frequency')
plt.title('Topic Distribution Across Documents')
plt.legend()
plt.grid(True)
plt.show()


# In[9]:


from gensim.models import CoherenceModel

# Compute coherence score
coherence_model_lda = CoherenceModel(model=lda_model, texts=df['tokens'], dictionary=dictionary, coherence='c_v')
coherence_lda = coherence_model_lda.get_coherence()

print('Coherence Score:', coherence_lda)

#Create another topic model (SKlearn , Spacy etc.) - 2 to 3 models 
#Do the evaluation using coherence score , perplexity , visualisation to see overlap of topics to evaluate the best topic model 
#Based on the best model find the dominant topic 


# In[10]:


# Compute perplexity
perplexity_score = lda_model.log_perplexity(corpus)
print('Perplexity Score:', perplexity_score)


# In[11]:


import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics.pairwise import cosine_similarity
from gensim.models import LdaModel
from gensim.corpora import Dictionary

# Assuming lda_model is your trained LDA model
# Assuming dictionary is your Gensim dictionary

# Get the topic-term matrix from the LDA model
topic_matrix = lda_model.get_topics()

# Compute pairwise cosine similarity between topics
similarity_matrix = cosine_similarity(topic_matrix)

# Create a heatmap
plt.figure(figsize=(10, 8))
plt.imshow(similarity_matrix, cmap='gray', interpolation='nearest')

# Add colorbar
plt.colorbar()

# Set ticks and labels
num_topics = similarity_matrix.shape[0]
plt.xticks(np.arange(num_topics), np.arange(num_topics))
plt.yticks(np.arange(num_topics), np.arange(num_topics))
plt.xlabel('Topic Index')
plt.ylabel('Topic Index')
plt.title('Topic Overlap Heatmap')

plt.show()

#darker the color higher the similarity greater overlap


# In[12]:


import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap

# Define the topic keywords and their distributions
topics = topics_dict

# Extract topic keywords and distributions
topic_keywords = list(topics.keys())
keyword_distributions = np.array([list(topic.values()) for topic in topics.values()])

# Calculate the overlap matrix
overlap_matrix = np.dot(keyword_distributions, keyword_distributions.T)

# Determine the maximum overlap value
max_overlap = np.max(overlap_matrix)

# Define a custom colormap
colors = [(0, 0, 1), (1, 0, 0)]  # Blue to red
cmap = LinearSegmentedColormap.from_list("Custom", colors, N=10)

# Plot the bubble chart with increased bubble size
plt.figure(figsize=(10, 8))
for i in range(overlap_matrix.shape[0]):
    for j in range(i + 1, overlap_matrix.shape[1]):
        bubble_size = overlap_matrix[i][j] / max_overlap * 8000  # Adjust bubble size relative to the maximum overlap
        color = 'red' if overlap_matrix[i][j] == max_overlap else cmap(overlap_matrix[i][j] / max_overlap)
        plt.scatter(i, j, s=bubble_size, alpha=0.5, label=f'Topic {i}-{j}', color=color)

# Add labels and legend
plt.xticks(range(len(topic_keywords)), topic_keywords, rotation=45, ha='right')
plt.yticks(range(len(topic_keywords)), topic_keywords)
plt.xlabel('Topics')
plt.ylabel('Topics')
plt.title('Topic Overlap Bubble Chart')
#plt.legend(prop={'size': 8})  # Set font size of legend labels

# Show plot
plt.tight_layout()
plt.show()

#Blue to red , hence the redder the color the greater the topic overlap 


# In[13]:


# Initialize an empty list to store the most dominant topic for each document
dominant_topics = []

# Iterate through the topic distributions for each document
for doc_topics in topic_distribution:
    # Sort the topic probabilities in descending order
    sorted_topics = sorted(doc_topics, key=lambda x: x[1], reverse=True)
    # Get the most dominant topic (the one with the highest probability)
    dominant_topic = sorted_topics[0][0]
    dominant_topics.append(dominant_topic)

# Add the dominant topics to the DataFrame
df['dominant_topic'] = dominant_topics

# Print the most dominant topic for each document
for index, row in df.iterrows():
    print("Document {}: Dominant Topic {}".format(index, row['dominant_topic']))


# ## Abstractive Summarisation

# In[29]:


#!pip3 install torch torchvision torchaudio
#!pip install transformers
#!pip install sentencepiece


# In[2]:


from transformers import PegasusForConditionalGeneration, PegasusTokenizer
import torch

model_name = 'google/pegasus-xsum'
torch_device = 'cuda' if torch.cuda.is_available() else 'cpu'
tokenizer = PegasusTokenizer.from_pretrained(model_name)
model = PegasusForConditionalGeneration.from_pretrained(model_name).to(torch_device)


# In[3]:


for index, row in df.iterrows():
    src_text = row['Body']
    #print("Text in Row {}: {}".format(index, text))
    batch = tokenizer.prepare_seq2seq_batch(src_text, truncation=True, padding='longest',return_tensors='pt')
    translated = model.generate(**batch)
    tgt_text = tokenizer.batch_decode(translated, skip_special_tokens=True)
    print(tgt_text)


# In[ ]:





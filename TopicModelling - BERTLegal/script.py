# Script to combine topic labels and their word distribution
import json

with open('./legal_bert_model/topic_labels.json', 'r') as file:
    topic_labels = json.load(file)

with open('./top_words_distribution.json', 'r') as file:
    word_distributions = json.load(file)

new_distribution = {}
for topic, label in topic_labels.items():
    if topic in word_distributions:
        new_distribution[label] = word_distributions[topic]

with open('words_distribution_with_topics.json', 'w') as file:
    json.dump(new_distribution, file, indent=4)

print('New JSON file has been created.')


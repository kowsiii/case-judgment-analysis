#print("hello world")
from dotenv import load_dotenv
import os
import openai
from openai import OpenAI
load_dotenv()

SYSTEM_PROMPT = "You are a smart and intelligent Named Entity Recognition (NER) system. I will provide you the definition of the entities you need to extract, the sentence from where your extract the entities and the output format with examples."

USER_PROMPT_1 = "Are you clear about your role?"

ASSISTANT_PROMPT_1 = "Sure, I'm ready to help you with your NER task. Please provide me with the necessary information to get started."

GUIDELINES_PROMPT = (
    "Entity Definition:\n"
    "1. PERSON: Short name or full name of a person from any geographic regions.\n"
    "2. DATE: Any format of dates. Dates can also be in natural language.\n"
    "3. LOC: Name of any geographic location, like cities, countries, continents, districts etc.\n"
    "\n"
    "Output Format:\n"
    "{{'PERSON': [list of entities present], 'DATE': [list of entities present], 'LOC': [list of entities present]}}\n"
    "If no entities are presented in any categories keep it None\n"
    "\n"
    "Examples:\n"
    "\n"
    "1. Sentence: Mr. Jacob lives in Madrid since 12th January 2015.\n"
    "Output: {{'PERSON': ['Mr. Jacob'], 'DATE': ['12th January 2015'], 'LOC': ['Madrid']}}\n"
    "\n"
    "2. Sentence: Mr. Rajeev Mishra and Sunita Roy are friends and they meet each other on 24/03/1998.\n"
    "Output: {{'PERSON': ['Mr. Rajeev Mishra', 'Sunita Roy'], 'DATE': ['24/03/1998'], 'LOC': ['None']}}\n"
    "\n"
    "3. Sentence: {}\n"
    "Output: "
)

MY_ENV_VAR=os.getenv("OPENAI_API_KEY")
client = OpenAI()
#print(MY_ENV_VAR)

# def openai_chat_completion_response(final_prompt):
#   response = client.chat.completions.create(
#               model="gpt-3.5-turbo",
#               messages=[
#                     {"role": "system", "content": SYSTEM_PROMPT},
#                     {"role": "user", "content": USER_PROMPT_1},
#                     {"role": "assistant", "content": ASSISTANT_PROMPT_1},
#                     {"role": "user", "content": final_prompt}
#                 ]
#             )

#   return response['choices'][0]['message']['content'].strip(" \n")


# my_sentence = "Hanyu Pinyin worked under Christopher in the same project for 2 years and the project started on 24-06-2018."
# GUIDELINES_PROMPT = GUIDELINES_PROMPT.format(my_sentence)
# ners = openai_chat_completion_response(GUIDELINES_PROMPT)
# print(ners)


chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Say this is a test",
        }
    ],
    model="gpt-3.5-turbo",
)
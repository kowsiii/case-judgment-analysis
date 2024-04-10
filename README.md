# case-judgment-analysis


## Prerequisites
Before you begin, ensure you have the following installed on your system:
- Python (3.x)
- pip (Python package installer)

## Installation
Clone the project repository to your local machine: `git clone https://github.com/kowsiii/case-judgment-analysis.git`

Navigate to the project directory: `cd case-judgment-analysis`


## Running the Web Application
##### Setting up the Backend Server:
1. Ensure that `sectionized_data.csv` and `legal_metadata_test.csv` are added to the root directory (case-judgement-analysis)
2. Navigate to backend directory: `cd backend`
3. Install dependencies: `pip install -r requirements.txt` or `pip3 install -r requirements.txt`
   Alternatively, all required packages are installed via the `requirements.txt` file, if you have to install them manually.
4. Running the server: `python index.py` or `python3 index.py`
5. The server will be running on [http://localhost:5000](http://localhost:5000)

##### Setting up the Frontend Server:
1. Navigate to backend directory: `cd frontend`
2. Install dependencies: `npm install` and ensure that node_modules folder has been added once this command has ran
3. Running the frontend server in the development mode: `npm run start`
4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.


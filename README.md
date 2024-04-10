# case-judgment-analysis

## Installation
Clone the project repository to your local machine: `git clone https://github.com/kowsiii/case-judgment-analysis.git`

Navigate to the project directory: `cd case-judgment-analysis`

Add `sectionized_data.csv` and `legal_metadata_test.csv` to the root directory (case-judgement-analysis)

## Running the Web Application

### Environment Setup
This web application has been tested to work with Python 3.8. 
If you encounter compatibility issues with newer versions of Python when setting up the virtual environment for the Backend Server, we recommend using Python 3.8.

##### Note for Windows users:
Please note that tensorflow-macos in requirements.txt is specific to macOS and is not required or applicable for Windows users. Adjust your requirements.txt accordingly for cross-platform compatibility.

#### Setting up the Backend Server:
1. Navigate to backend directory: `cd backend`
2. Create a Virtual Environment with Python 3.8: `python3.8 -m venv venv`
3. Activate the Virtual Environment,
   On macOS and Linux: `source venv/bin/activate`
   On Windows: `.\venv\Scripts\activate`
4. Install Dependencies: `pip install -r requirements.txt`
5. Run the server: `flask run`
7. The server will be running on [http://localhost:5000](http://localhost:5000)

#### Setting up the Frontend Server:
1. Navigate to backend directory: `cd frontend`
2. Install dependencies: `npm install` and ensure that node_modules folder has been added once this command has ran
3. Running the frontend server in the development mode: `npm run start`
4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.


# Alpaca Health Software Engineering Take-Home Project


## Setup Instructions

### Backend Setup (Python 3.11+ required)

```bash
# Create and activate virtual environment
python -m venv alpaca_venv
source alpaca_venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```

### Frontend Setup (Node.js 18+ required)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Project Structure

- `frontend/`: Next.js application
  - `src/components/`: Reusable React components
  - `src/app/`: Next.js app router pages
- `backend/`: FastAPI application
  - `main.py`: API endpoints
  - `database.py`: Sets up SQLite database connection
  - `models.py`: Defines Note database table 
  - `utils/openai_utils.py`: Handles OpenAI API integration and prompt engineering

## Approach and challenges
- I started off with high-level planning and mockups to visualize the user journey and understand the core functionalities needed for an MVP
- I prioritized setting up the backend first, focusing on designing data model(s) and API endpoints for CRUD operations 
- I moved on to integrating the OpenAI API, testing endpoints with FastAPI docs, and refining the prompt engineering until I was satisfied with the generated notes 
- Once the backend was working as expected, I moved on to implementing the frontend, building and iterating from my initial mockups

### Challenges
- Ran into OpenAI API rate limit issues during testing but resolved by upgrading to paid plan 
- Ran into difficulties with some package imports and resolved by reinstalling packages/making necessary updates in the virtual environment 
- Getting ramped up with technologies/frameworks
- Crafting appropriate prompts for ABA therapy note generation 

## Design decisions
### Technical
- I chose SQLite for the database because it’s easy to get started with (Postgres, MySQL would’ve required more of a setup time)
- Skipped authentication/login and focused on a single therapists’ notes (to reduce complexity and make better use of time)
### UI/UX 
- Included sidebar for previous notes in descending order (most recent first)
- Included date and session type tags on previous notes for quicker identification
- Positioned generated notes directly below input form for easy comparison, with immediate access to edit, save, and delete note 
### Scope
- Deferred stretch goals (regenerating specific sections, AI formatting/style) to focus on getting a working solution
- Focused on implementing functionality based on user stories and deferred functionalities like login, search/filter, pagination, and descriptive error messages
## Assumptions
- App for a single therapists notes (no multi-user authentication)
- Assumed ABA therapy prompt by focusing on readability (with structured headings) and professional/objective language 
- Came up with three session types (individual, group, family) sufficient for an MVP
- Assumed therapist would want notes in descending order and a dropdown for type of session and duration for efficiency
## Sources
- OpenAI API, FastAPI, Next.js documentation
- [Python API Development](https://www.youtube.com/watch?v=0sOvCWFmrtA&list=LL&index=3&ab_channel=freeCodeCamp.org) Youtube tutorial
- [How to build a React + FastAPI application](https://www.youtube.com/watch?v=0zb2kohYZIM&ab_channel=EricRoby) Youtube tutorial
- ChatGPT and Claude.AI tools (especially for UI implementation and debugging in short time frame)



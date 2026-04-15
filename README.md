# Sem4-DBMS-Project

This repository contains a frontend and backend for the DBMS project.

## Contribution Workflow (Detailed)

Follow this exact flow when you want to contribute:

1. **Fork the repository**

Create your own copy of the project on GitHub by clicking the Fork button.

Why this matters:
- You should not push directly to the original repository.
- Your fork is your personal workspace for making and testing changes.

2. **Clone your fork**

Clone your fork to your local machine using the URL of your forked repo:

```bash
git clone https://github.com/<your-username>/<your-fork-repo>.git
cd <your-fork-repo>
```

Why this matters:
- Cloning downloads the full repository and history to your local system.
- Running cd into the project ensures all next commands run in the correct folder.

3. **Create a new branch**

Create a branch before making any changes:

```bash
git checkout -b feature/<short-description>
```

Examples:
- feature/login-api
- fix/student-table-bug
- docs/update-readme

Why this matters:
- Keeps your work isolated from main.
- Makes code review and pull requests focused and easy to understand.
- Lets you work on multiple features independently.

4. **Add and commit your changes**

After editing files, check what changed:

```bash
git status
```

Stage files:

```bash
git add .
```

Create a clear commit message:

```bash
git commit -m "Add: user authentication API"
```

Commit message tips:
- Use present tense.
- Keep it specific.
- One commit should represent one logical change.

5. **Push your branch to your fork**

```bash
git push origin feature/<short-description>
```

Why this matters:
- This uploads your local branch to GitHub so it can be reviewed.

6. **Create a Pull Request (PR)**

Open your fork on GitHub. You will usually see a prompt to Compare & pull request.

PR checklist:
- Base repository: original project repo
- Base branch: main (or the target branch used by maintainers)
- Compare branch: your feature branch
- Add a clear PR title and description
- Describe what changed, why, and how it was tested

Why this matters:
- A PR is the formal way to request your changes be merged.
- It enables discussion, code review, and quality checks.

---

## Project Setup After Cloning and Creating a Branch

Run these steps immediately after cloning and creating a branch.

### Frontend Setup

1. **Go to the frontend directory:**

```bash
cd frontend
```

2. **Install dependencies:**

```bash
npm i
```

What this does:
- Downloads all frontend packages listed in package.json.
- Creates node_modules needed to run/build the frontend.

### Backend Setup

1. **Return to project root (if needed), then enter backend:**

```bash
cd backend
```

2. **Create a virtual environment named myenv:**

```bash
python3 -m venv myenv
```

3. **Activate the virtual environment:**

```bash
source myenv/bin/activate
```

4. **Install dependencies from requirements.txt:**

```bash
pip install -r requirements.txt
```

What this does:
- Keeps Python dependencies isolated to this project.
- Installs all backend packages required to run the API.

---

## Typical Daily Git Flow

From project root:

```bash
git checkout main
git pull origin main
git checkout feature/<short-description>
git add .
git commit -m "Your clear commit message"
git push origin feature/<short-description>
```

Then update or create your Pull Request on GitHub.

# Task 6: Transaction History API

Endpoint:
GET /api/transactions/history/{vpa}

Description:
Retrieves a user's transaction history using a database view. Instead of performing JOIN operations in the backend, the system queries a pre-defined database view that already combines transaction and account data.

Implementation:
- A database view named vw_User_Transaction_History is created.
- The view joins Transactions with Accounts twice to expose sender_vpa and receiver_vpa.
- The backend queries this view using parameterized SQL.
- Results are sorted in descending order of created_at (latest first).

Response Structure:
- transaction_id
- sender_vpa
- receiver_vpa
- amount
- status
- created_at
- type

Transaction Type Logic:
- If sender_vpa matches the requested VPA, the transaction type is DEBIT.
- If receiver_vpa matches the requested VPA, the transaction type is CREDIT.

Key Design Decisions:
- The backend does not perform JOIN logic.
- The database handles data composition via the view.
- The backend focuses on validation, formatting, and response generation.

Benefits:
- Cleaner backend code.
- Improved query readability.
- Better separation of concerns between the database and API layer.

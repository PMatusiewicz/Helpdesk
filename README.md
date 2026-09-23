# Helpdesk - report system

Application where clients report different issues, engineers resolve these issues and admins manage reports and settings.
Application was made for internship purposes.

## Used technologies
- Backend: Django + Django REST Framework
- Frontend: Angular
- Database: PostgreSQL

## Requirements
- Python 3.13.15
- Node.js 24.19.0
- npm 11.17.0
- PostgreSQL 18.6

## Running the backend
1. Clone the repository 
```bash
git clone https://github.com/PMatusiewicz/Helpdesk.git
```
2. Go to the backend directory
3. Create and activate virtual environment
```bash
python -m venv venv
venv\Scripts\activate     #windows
source venv/bin/activate  #linux
```
4. Install dependencies
```bash
pip install -r requirements.txt
```
5. Configure the database
   - Create a PostgreSQL database
   - Create a `.env` file in the backend directory with the following variables:
```bash
     SECRET_KEY=your_secret_key
     DB_NAME=your_database_name
     DB_USER=your_database_user
     DB_PASSWORD=your_database_password
     DB_HOST=localhost
     DB_PORT=5432
```
6. Make migrations
```bash
python manage.py migrate
```
7. Create an admin user, then set the role field to admin in django admin panel
```bash
   python manage.py createsuperuser
```
8. Run server
```bash
python manage.py runserver
```

## Running the frontend
1. Go to the frontend directory
2. Install dependencies 
```bash
npm install
```
3. Run frontend
```bash
ng serve
```
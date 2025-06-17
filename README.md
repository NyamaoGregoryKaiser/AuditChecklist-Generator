# Audit Checklist Application

A comprehensive audit management system built with Django and React.

## Features

- User authentication and authorization
- Admin dashboard for user management
- Audit creation and management
- Checklist generation and management
- Response tracking and reporting
- Real-time updates

## Tech Stack

### Backend
- Django
- Django REST Framework
- PostgreSQL
- JWT Authentication

### Frontend
- React
- TypeScript
- Material-UI
- React Router
- Axios

## Setup Instructions

### Backend Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file in the backend directory with:
```
DEBUG=True
SECRET_KEY=your_secret_key
DATABASE_URL=your_database_url
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Start the server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with:
```
REACT_APP_API_URL=http://localhost:8000/api
```

4. Start the development server:
```bash
npm start
```

## API Documentation

The API documentation is available at `/swagger` when running the backend server.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
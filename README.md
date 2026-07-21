# AutoMatch - Car Recommendation System

A production-ready car recommendation system where users describe what they need a car for in natural language, and an LLM recommends matching vehicles with explainable reasoning. Built with FastAPI backend, React Native mobile app, and Docker infrastructure.

## Features

- **Natural Language Processing**: Users describe their needs in plain English or French
- **LLM-Powered Recommendations**: Uses OpenAI GPT-4o-mini for intelligent car matching
- **Explainable AI**: Each recommendation includes specific reasons and trade-offs
- **Multi-Language Support**: English and French with auto-detection from device settings
- **Car Comparison**: Side-by-side comparison of multiple vehicles
- **20+ Vehicle Database**: Comprehensive database covering all use cases (family, commute, adventure, truck, luxury, budget, electric, fun)
- **Weighted Scoring Algorithm**: Multi-attribute scoring with priority weights
- **React Native Mobile App**: Beautiful, responsive mobile interface
- **REST API**: Full-featured FastAPI backend with auto-generated documentation

## Project Structure

```
automatch/
├── backend/
│   ├── main.py              # FastAPI application (all endpoints)
│   ├── prompts.py           # LLM system prompts with few-shot examples
│   ├── cars_db.py           # 20-car seed database with realistic specs
│   ├── scoring.py           # Car scoring and matching algorithm
│   ├── models.py            # Pydantic request/response schemas
│   ├── config.py            # Settings and LLM client setup
│   ├── test_main.py         # pytest suite (15+ tests)
│   ├── requirements.txt     # Dependencies
│   └── Dockerfile           # Docker configuration
├── mobile/
│   ├── App.js               # React Native entry with navigation
│   ├── api.js               # Axios service layer
│   ├── i18n.js              # Internationalization configuration
│   ├── package.json         # Dependencies
│   └── screens/
│       ├── WelcomeScreen.js
│       ├── QueryScreen.js
│       ├── LoadingScreen.js
│       ├── ResultsScreen.js
│       ├── DetailScreen.js
│       └── CompareScreen.js
├── docker-compose.yml       # Backend + PostgreSQL + Redis
├── .env.example             # All required environment variables
└── README.md                # This file
```

## Prerequisites

- **Python**: 3.10 or higher
- **Node.js**: 18 or higher
- **Docker**: Latest version (for containerized deployment)
- **OpenAI API Key**: Required for LLM features (get one at https://platform.openai.com/)

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/automatch
REDIS_URL=redis://localhost:6379
API_BASE_URL=http://localhost:8000
```

## Backend Setup

### Option 1: Direct Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp ../.env.example ../.env
# Edit .env with your OpenAI API key
```

5. Run the server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Option 2: Docker

1. Build and start all services:
```bash
docker-compose up
```

The API will be available at `http://localhost:8000`

## Mobile App Setup

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Set environment variable for API URL:
```bash
export API_BASE_URL=http://localhost:8000
```

4. Start the development server:
```bash
npx expo start
```

5. Follow the Expo instructions to run on:
   - **iOS**: Press `i` in the terminal
   - **Android**: Press `a` in the terminal
   - **Web**: Press `w` in the terminal

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### API Endpoints

#### POST /api/recommendations
Get personalized car recommendations based on natural language query.

**Request:**
```json
{
  "query": "I have 3 kids and commute 2 hours",
  "budget_max": 45000,
  "location": "90210",
  "language": "en"
}
```

**Response:**
```json
{
  "extracted_needs": {
    "seating_capacity": 7,
    "priority_attributes": ["safety", "cargo"],
    "use_case_tags": ["family"]
  },
  "recommendations": [
    {
      "car_id": "honda_crv_hybrid_2026",
      "score": 0.85,
      "match_reason": "Excellent fuel efficiency with 43 MPG city...",
      "trade_offs": "Higher price point compared to some competitors."
    }
  ]
}
```

#### GET /api/cars/{car_id}
Get detailed information about a specific car.

#### POST /api/cars/compare
Compare multiple cars side-by-side.

**Request:**
```json
{
  "car_ids": ["honda_crv_hybrid_2026", "toyota_camry_hybrid_2026"]
}
```

#### POST /api/feedback
Submit feedback for a car recommendation.

#### GET /health
Health check endpoint.

## Testing

### Backend Tests

Run the test suite:

```bash
cd backend
pytest test_main.py -v
```

The test suite includes 15+ tests covering:
- Valid recommendation requests
- Vague query handling
- Budget constraints
- Invalid requests (422 errors)
- Car not found (404 errors)
- Compare endpoint
- Feedback endpoint
- Scoring algorithm edge cases
- French language queries
- Hard constraint filtering
- Soft constraint scoring

## Language Support

The system supports English and French with automatic detection:

### Backend
- LLM prompts include French examples
- System accepts French queries and returns French explanations
- Language parameter in API requests (`en` or `fr`)

### Mobile App
- Auto-detects device language on startup
- Manual language switching via i18next
- All UI strings localized
- French translations for all screens

### Example Queries

**English:**
- "I have 3 kids and commute 2 hours"
- "I tow a 5000lb boat and camp in the mountains"

**French:**
- "J'ai 3 enfants et je fais du covoiturage"
- "Je tracte un bateau de 5000 lbs et je campe dans les montagnes"

## Car Database

The system includes 20 realistic 2025-2026 vehicles:

**Family Vehicles:**
- Honda CR-V Hybrid
- Toyota Sienna
- Kia Telluride
- Subaru Ascent

**Commuter Vehicles:**
- Toyota Camry Hybrid
- Tesla Model 3
- Honda Accord

**Adventure Vehicles:**
- Ford Bronco
- Jeep Wrangler
- Toyota 4Runner

**Trucks:**
- Ford F-150
- Ram 1500
- Toyota Tacoma

**Luxury Vehicles:**
- BMW X5
- Mercedes GLC
- Lexus RX

**Budget Vehicles:**
- Hyundai Elantra
- Kia Soul
- Nissan Versa

**Electric Vehicles:**
- Tesla Model Y
- Ford Mustang Mach-E
- Hyundai Ioniq 5

**Fun Vehicles:**
- Mazda MX-5 Miata
- Toyota GR86
- Ford Mustang

## Scoring Algorithm

The system uses a weighted multi-attribute scoring algorithm:

1. **Hard Constraints** (filter out mismatches):
   - Budget (new vs used pricing)
   - Seating capacity
   - Towing capacity
   - Fuel type preference
   - Body type preference
   - Drivetrain preference

2. **Soft Constraints** (scored 0-1):
   - Fuel efficiency (MPG)
   - Safety rating
   - Reliability score
   - Cargo space
   - Towing capacity
   - Off-road capability
   - Luxury features
   - Sportiness
   - Use case matching

3. **Priority Weights**:
   - User-mentioned attributes receive higher weights
   - Weights are normalized to sum to 1.0
   - Final score is weighted sum of all attributes

## Docker Deployment

### Production Deployment

1. Build and start services:
```bash
docker-compose up -d
```

2. View logs:
```bash
docker-compose logs -f
```

3. Stop services:
```bash
docker-compose down
```

### Services

- **API**: FastAPI backend on port 8000
- **PostgreSQL**: Database on port 5432
- **Redis**: Cache on port 6379

## Troubleshooting

### Backend Issues

**OpenAI API Key Missing:**
- Ensure `OPENAI_API_KEY` is set in `.env`
- Without API key, the system uses fallback mock data

**Port Already in Use:**
- Change port in `config.py` or docker-compose.yml
- Or stop the process using port 8000

### Mobile App Issues

**API Connection Failed:**
- Ensure backend is running
- Check `API_BASE_URL` environment variable
- Verify backend CORS settings

**Expo Build Errors:**
- Clear Expo cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Development

### Adding New Cars

Edit `backend/cars_db.py` and add new car entries to the `CARS` list with all required fields.

### Modifying Scoring

Edit `backend/scoring.py` to adjust scoring weights or add new scoring criteria.

### Adding Translations

Edit `mobile/i18n.js` to add new languages or update existing translations.

## License

This project is provided as-is for educational and demonstration purposes.

## Support

For issues or questions, please refer to the API documentation at `/docs` or review the test suite for usage examples.
"# Autocar" 
#   A u t o c a r  
 
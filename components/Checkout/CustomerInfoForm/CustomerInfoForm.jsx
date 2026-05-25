import React, { useState } from 'react';
import CustomSelect from '../CustomSelect';
import './CustomerInfoForm.css';

// Complete list of California cities
const californiaCities = [
  'Adelanto',
  'Agoura Hills',
  'Alameda',
  'Albany',
  'Alhambra',
  'Aliso Viejo',
  'Alturas',
  'Amador City',
  'American Canyon',
  'Anaheim',
  'Anderson',
  'Angels Camp',
  'Antioch',
  'Apple Valley',
  'Arcadia',
  'Arcata',
  'Arroyo Grande',
  'Artesia',
  'Arvin',
  'Atascadero',
  'Atherton',
  'Atwater',
  'Auburn',
  'Avalon',
  'Avenal',
  'Azusa',
  'Bakersfield',
  'Baldwin Park',
  'Banning',
  'Barstow',
  'Beaumont',
  'Bell',
  'Bell Gardens',
  'Bellflower',
  'Belmont',
  'Belvedere',
  'Benicia',
  'Berkeley',
  'Beverly Hills',
  'Big Bear Lake',
  'Biggs',
  'Bishop',
  'Blue Lake',
  'Blythe',
  'Bradbury',
  'Brawley',
  'Brea',
  'Brentwood',
  'Brisbane',
  'Buellton',
  'Buena Park',
  'Burbank',
  'Burlingame',
  'Calabasas',
  'Calexico',
  'California City',
  'Calimesa',
  'Calipatria',
  'Calistoga',
  'Camarillo',
  'Campbell',
  'Canyon Lake',
  'Capitola',
  'Carlsbad',
  'Carmel-by-the-Sea',
  'Carpinteria',
  'Carson',
  'Cathedral City',
  'Ceres',
  'Cerritos',
  'Chico',
  'Chino',
  'Chino Hills',
  'Chowchilla',
  'Chula Vista',
  'Citrus Heights',
  'City of Industry',
  'Claremont',
  'Clayton',
  'Clearlake',
  'Cloverdale',
  'Clovis',
  'Coachella',
  'Coalinga',
  'Colfax',
  'Colma',
  'Colton',
  'Colusa',
  'Commerce',
  'Compton',
  'Concord',
  'Corcoran',
  'Corning',
  'Corona',
  'Coronado',
  'Corte Madera',
  'Costa Mesa',
  'Cotati',
  'Covina',
  'Crescent City',
  'Cudahy',
  'Culver City',
  'Cupertino',
  'Cypress',
  'Daly City',
  'Dana Point',
  'Danville',
  'Davis',
  'Del Mar',
  'Del Rey Oaks',
  'Delano',
  'Desert Hot Springs',
  'Diamond Bar',
  'Dinuba',
  'Dixon',
  'Dorris',
  'Dos Palos',
  'Downey',
  'Duarte',
  'Dublin',
  'Dunsmuir',
  'East Palo Alto',
  'Eastvale',
  'El Cajon',
  'El Centro',
  'El Cerrito',
  'El Monte',
  'El Segundo',
  'Elk Grove',
  'Emeryville',
  'Encinitas',
  'Escalon',
  'Escondido',
  'Etna',
  'Eureka',
  'Exeter',
  'Fair Oaks',
  'Fairfax',
  'Fairfield',
  'Farmersville',
  'Ferndale',
  'Fillmore',
  'Firebaugh',
  'Folsom',
  'Fontana',
  'Fort Bragg',
  'Fort Jones',
  'Fortuna',
  'Foster City',
  'Fountain Valley',
  'Fowler',
  'Fremont',
  'Fresno',
  'Fullerton',
  'Galt',
  'Garden Grove',
  'Gardena',
  'Gilroy',
  'Glendale',
  'Glendora',
  'Goleta',
  'Gonzales',
  'Gold River',
  'Grand Terrace',
  'Grass Valley',
  'Greenfield',
  'Gridley',
  'Grover Beach',
  'Guadalupe',
  'Gustine',
  'Half Moon Bay',
  'Hanford',
  'Hawaiian Gardens',
  'Hawthorne',
  'Hayward',
  'Healdsburg',
  'Hemet',
  'Hercules',
  'Hermosa Beach',
  'Hesperia',
  'Hidden Hills',
  'Highland',
  'Hillsborough',
  'Hollister',
  'Holtville',
  'Hughson',
  'Huntington Beach',
  'Huntington Park',
  'Huron',
  'Imperial',
  'Imperial Beach',
  'Indian Wells',
  'Indio',
  'Inglewood',
  'Ione',
  'Irvine',
  'Irwindale',
  'Isleton',
  'Jackson',
  'Jurupa Valley',
  'Kerman',
  'King City',
  'Kingsburg',
  'La Cañada Flintridge',
  'La Habra',
  'La Mesa',
  'La Mirada',
  'La Palma',
  'La Puente',
  'La Quinta',
  'La Verne',
  'Lafayette',
  'Laguna Beach',
  'Laguna Hills',
  'Laguna Niguel',
  'Lake Elsinore',
  'Lake Forest',
  'Lakeport',
  'Lakewood',
  'Lancaster',
  'Larkspur',
  'Lathrop',
  'Lawndale',
  'Lemon Grove',
  'Lemoore',
  'Lincoln',
  'Lindsay',
  'Live Oak',
  'Livermore',
  'Lodi',
  'Loma Linda',
  'Lomita',
  'Lompoc',
  'Long Beach',
  'Los Alamitos',
  'Los Altos',
  'Los Angeles',
  'Los Banos',
  'Los Gatos',
  'Lynwood',
  'Madera',
  'Malibu',
  'Mammoth Lakes',
  'Manhattan Beach',
  'Manteca',
  'Maricopa',
  'Marina',
  'Martinez',
  'Marysville',
  'Maywood',
  'McFarland',
  'Mendota',
  'Menifee',
  'Menlo Park',
  'Merced',
  'Mill Valley',
  'Millbrae',
  'Milpitas',
  'Mission Viejo',
  'Modesto',
  'Monrovia',
  'Montclair',
  'Monte Sereno',
  'Montebello',
  'Monterey',
  'Monterey Park',
  'Moorpark',
  'Moraga',
  'Moreno Valley',
  'Morgan Hill',
  'Morro Bay',
  'Mount Shasta',
  'Mountain View',
  'Murrieta',
  'Napa',
  'National City',
  'Needles',
  'Nevada City',
  'Newark',
  'Newman',
  'Newport Beach',
  'Norco',
  'Norwalk',
  'Novato',
  'Oakdale',
  'Oakland',
  'Oakley',
  'Oceanside',
  'Ojai',
  'Ontario',
  'Orange',
  'Orange Cove',
  'Orangevale',
  'Orinda',
  'Orland',
  'Oroville',
  'Oxnard',
  'Pacifica',
  'Palm Desert',
  'Palm Springs',
  'Palmdale',
  'Palo Alto',
  'Palos Verdes Estates',
  'Paradise',
  'Paramount',
  'Parlier',
  'Pasadena',
  'Paso Robles',
  'Patterson',
  'Perris',
  'Petaluma',
  'Pico Rivera',
  'Piedmont',
  'Pinole',
  'Pismo Beach',
  'Pittsburg',
  'Placentia',
  'Placerville',
  'Pleasant Hill',
  'Pleasanton',
  'Plymouth',
  'Point Arena',
  'Pomona',
  'Port Hueneme',
  'Porterville',
  'Portola',
  'Portola Valley',
  'Poway',
  'Rancho Cordova',
  'Rancho Cucamonga',
  'Rancho Mirage',
  'Rancho Palos Verdes',
  'Rancho Santa Margarita',
  'Red Bluff',
  'Redding',
  'Redlands',
  'Redondo Beach',
  'Redwood City',
  'Reedley',
  'Rialto',
  'Richmond',
  'Ridgecrest',
  'Rio Dell',
  'Rio Vista',
  'Ripon',
  'Riverbank',
  'Riverside',
  'Rocklin',
  'Rohnert Park',
  'Rolling Hills',
  'Rolling Hills Estates',
  'Rosemead',
  'Roseville',
  'Ross',
  'Sacramento',
  'St. Helena',
  'Salinas',
  'San Anselmo',
  'San Bernardino',
  'San Bruno',
  'San Carlos',
  'San Clemente',
  'San Diego',
  'San Dimas',
  'San Fernando',
  'San Francisco',
  'San Gabriel',
  'San Jacinto',
  'San Joaquin',
  'San Jose',
  'San Juan Bautista',
  'San Juan Capistrano',
  'San Leandro',
  'San Luis Obispo',
  'San Marcos',
  'San Marino',
  'San Mateo',
  'San Pablo',
  'San Rafael',
  'San Ramon',
  'Sand City',
  'Sanger',
  'Santa Ana',
  'Santa Barbara',
  'Santa Clara',
  'Santa Clarita',
  'Santa Cruz',
  'Santa Fe Springs',
  'Santa Maria',
  'Santa Monica',
  'Santa Paula',
  'Santa Rosa',
  'Santee',
  'Saratoga',
  'Sausalito',
  'Scotts Valley',
  'Seal Beach',
  'Seaside',
  'Sebastopol',
  'Selma',
  'Shafter',
  'Shasta Lake',
  'Sierra Madre',
  'Signal Hill',
  'Simi Valley',
  'Solana Beach',
  'Soledad',
  'Solvang',
  'Sonoma',
  'Sonora',
  'South El Monte',
  'South Gate',
  'South Lake Tahoe',
  'South Pasadena',
  'South San Francisco',
  'Stanton',
  'Stockton',
  'Suisun City',
  'Sunnyvale',
  'Susanville',
  'Taft',
  'Tehachapi',
  'Tehama',
  'Temecula',
  'Temple City',
  'Thousand Oaks',
  'Tiburon',
  'Torrance',
  'Tracy',
  'Trinidad',
  'Truckee',
  'Tulare',
  'Tulelake',
  'Turlock',
  'Tustin',
  'Twentynine Palms',
  'Ukiah',
  'Union City',
  'Upland',
  'Vacaville',
  'Vallejo',
  'Ventura',
  'Vernon',
  'Victorville',
  'Villa Park',
  'Visalia',
  'Vista',
  'Walnut',
  'Walnut Creek',
  'Wasco',
  'Waterford',
  'Watsonville',
  'Weed',
  'West Covina',
  'West Hollywood',
  'West Sacramento',
  'Westlake Village',
  'Westminster',
  'Westmorland',
  'Wheatland',
  'Whittier',
  'Williams',
  'Willits',
  'Willows',
  'Windsor',
  'Winters',
  'Woodlake',
  'Woodland',
  'Yorba Linda',
  'Yreka',
  'Yuba City',
  'Yucaipa',
];

// Convert cities array to custom select format, removing duplicates
const uniqueCities = [...new Set(californiaCities)];
const cityOptions = uniqueCities.map(city => ({
  value: city,
  label: city,
}));

const CustomerInfoForm = ({ customerInfo, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    ...customerInfo,
    state: 'California', // Ensure state is always California
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleCityChange = value => {
    setFormData(prev => ({
      ...prev,
      city: value,
    }));

    // Clear error when user selects a city
    if (errors.city) {
      setErrors(prev => ({
        ...prev,
        city: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    // State is always California, no validation needed

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="customer-info-form">
      <div className="customer-info-form-header">
        <h3 className="customer-info-form-title">Shipping Information</h3>
        <p className="customer-info-form-subtitle">
          Please provide your shipping details
        </p>
      </div>

      <div className="customer-info-form-fields">
        <div className="customer-info-form-row">
          <div className="customer-info-form-field">
            <label htmlFor="name" className="customer-info-form-label">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`customer-info-form-input ${
                errors.name ? 'error' : ''
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <span className="customer-info-form-error">{errors.name}</span>
            )}
          </div>
        </div>

        <div className="customer-info-form-row">
          <div className="customer-info-form-field">
            <label htmlFor="email" className="customer-info-form-label">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`customer-info-form-input ${
                errors.email ? 'error' : ''
              }`}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <span className="customer-info-form-error">{errors.email}</span>
            )}
          </div>
        </div>

        <div className="customer-info-form-row">
          <div className="customer-info-form-field">
            <label htmlFor="address" className="customer-info-form-label">
              Street Address *
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={`customer-info-form-input ${
                errors.address ? 'error' : ''
              }`}
              placeholder="Enter your street address"
            />
            {errors.address && (
              <span className="customer-info-form-error">{errors.address}</span>
            )}
          </div>
        </div>

        <div className="customer-info-form-field">
          <label htmlFor="city" className="customer-info-form-label">
            City *
          </label>
          <CustomSelect
            id="city"
            name="city"
            value={formData.city}
            onChange={handleCityChange}
            options={cityOptions}
            placeholder="Select a city"
            isSearchable={true}
            isClearable={true}
            className={errors.city ? 'error' : ''}
            error={!!errors.city}
          />
          {errors.city && (
            <span className="customer-info-form-error">{errors.city}</span>
          )}
        </div>

        <div className="customer-info-form-row customer-info-form-row-three">
          <div className="customer-info-form-field">
            <label htmlFor="state" className="customer-info-form-label">
              State *
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value="California"
              readOnly
              className="customer-info-form-input readonly"
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
            <small
              style={{
                color: '#666',
                fontSize: '12px',
                marginTop: '4px',
                display: 'block',
              }}
            >
              We currently only deliver to California
            </small>
          </div>

          <div className="customer-info-form-field">
            <label htmlFor="zipCode" className="customer-info-form-label">
              ZIP Code *
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              className={`customer-info-form-input ${
                errors.zipCode ? 'error' : ''
              }`}
              placeholder="Enter ZIP code"
            />
            {errors.zipCode && (
              <span className="customer-info-form-error">{errors.zipCode}</span>
            )}
          </div>
        </div>
      </div>

      <div className="customer-info-form-footer">
        <button
          type="submit"
          className="customer-info-form-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Continue to Payment'}
        </button>
      </div>
    </form>
  );
};

export default CustomerInfoForm;

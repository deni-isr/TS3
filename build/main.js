'use strict';

const restaurantRow = (restaurant) => {
    const { name, address, company } = restaurant;
    const tr = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.textContent = name;
    const addressCell = document.createElement('td');
    addressCell.textContent = address;
    const companyCell = document.createElement('td');
    companyCell.textContent = company;
    tr.appendChild(nameCell);
    tr.appendChild(addressCell);
    tr.appendChild(companyCell);
    return tr;
};
const restaurantModal = (restaurant, menu) => {
    const { name, address, city, postalCode, phone, company } = restaurant;
    let html = `<h3>${name}</h3>
    <p>${company}</p>
    <p>${address} ${postalCode} ${city}</p>
    <p>${phone}</p>
    <table>
      <tr>
        <th>Course</th>
        <th>Diet</th>
        <th>Price</th>
      </tr>
    `;
    menu.courses.forEach((course) => {
        const { name: courseName, diets, price } = course;
        const dietsText = Array.isArray(diets) ? diets.join(', ') : (diets ?? ' - ');
        const priceText = typeof price === 'number' ? String(price) : (price ?? ' - ');
        html += `
      <tr>
        <td>${courseName}</td>
        <td>${dietsText}</td>
        <td>${priceText}</td>
      </tr>
    `;
    });
    html += '</table>';
    return html;
};
const errorModal = (message) => {
    return `
    <h3>Error</h3>
    <p>${message}</p>
  `;
};

const fetchData = async (url, options = {}) => {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Error ${response.status} occured`);
    }
    const json = response.json();
    return json;
};

const apiUrl = 'https://sodexo-webscrape-r73sdlmfxa-lz.a.run.app/api/v1';
const positionOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
};

const modal = document.querySelector('dialog');
if (!modal) {
    throw new Error('Modal not found');
}
modal.addEventListener('click', () => {
    modal.close();
});
const calculateDistance = (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
const createTable = (restaurants) => {
    const table = document.querySelector('table');
    if (!table) {
        console.warn('Table element not found');
        return;
    }
    table.innerHTML = '';
    restaurants.forEach((restaurant) => {
        const tr = restaurantRow(restaurant);
        table.appendChild(tr);
        tr.addEventListener('click', async () => {
            try {
                document
                    .querySelectorAll('.highlight')
                    .forEach((el) => el.classList.remove('highlight'));
                tr.classList.add('highlight');
                modal.innerHTML = '';
                const menu = (await fetchData(`${apiUrl}/restaurants/daily/${restaurant._id}/fi`));
                const menuHtml = restaurantModal(restaurant, menu);
                modal.insertAdjacentHTML('beforeend', menuHtml);
                modal.showModal();
            }
            catch (error) {
                const msg = error.message ?? 'Unknown error';
                modal.innerHTML = errorModal(msg);
                modal.showModal();
            }
        });
    });
};
const error = (err) => {
    console.warn(`ERROR(${err.code}): ${err.message}`);
};
const success = async (pos) => {
    try {
        const crd = pos.coords;
        const restaurants = (await fetchData(`${apiUrl}/restaurants`));
        restaurants.sort((a, b) => {
            const x1 = crd.latitude;
            const y1 = crd.longitude;
            const x2a = a.location.coordinates[1];
            const y2a = a.location.coordinates[0];
            const distanceA = calculateDistance(x1, y1, x2a, y2a);
            const x2b = b.location.coordinates[1];
            const y2b = b.location.coordinates[0];
            const distanceB = calculateDistance(x1, y1, x2b, y2b);
            return distanceA - distanceB;
        });
        createTable(restaurants);
        const sodexoBtn = document.querySelector('#sodexo');
        const compassBtn = document.querySelector('#compass');
        const resetBtn = document.querySelector('#reset');
        if (!sodexoBtn || !compassBtn || !resetBtn) {
            console.warn('Filter buttons not found');
            return;
        }
        sodexoBtn.addEventListener('click', () => {
            const sodexoRestaurants = restaurants.filter((restaurant) => restaurant.company === 'Sodexo');
            createTable(sodexoRestaurants);
        });
        compassBtn.addEventListener('click', () => {
            const compassRestaurants = restaurants.filter((restaurant) => restaurant.company === 'Compass Group');
            createTable(compassRestaurants);
        });
        resetBtn.addEventListener('click', () => {
            createTable(restaurants);
        });
    }
    catch (error) {
        const msg = error.message ?? 'Unknown error';
        modal.innerHTML = errorModal(msg);
        modal.showModal();
    }
};
navigator.geolocation.getCurrentPosition(success, error, positionOptions);

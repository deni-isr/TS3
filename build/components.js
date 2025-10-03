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
export { restaurantRow, restaurantModal, errorModal };

const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleSidebar");

toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("collapsed");
});
function updateDateTime() {
  const now = new Date();

  // Get the time components
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert to 12-hour format

  // Get the day and date components
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const day = days[now.getDay()];
  const date = now.getDate();

  // Function to get the ordinal suffix for the date
  function getOrdinalSuffix(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  }

  const dateWithSuffix = date + getOrdinalSuffix(date);

  // Update the HTML elements
  document.querySelector(
    ".time-text span:first-child"
  ).textContent = `${hours}:${minutes}`;
  document.querySelector(".time-text .time-sub-text").textContent = ampm;
  document.querySelector(".day-text").textContent = `${day}, ${getMonthName(
    now.getMonth()
  )} ${dateWithSuffix}`;
}

function getMonthName(monthIndex) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[monthIndex];
}

// Call the function to update the time and date when the page loads
updateDateTime();

// Optionally, update the time every second (1000 milliseconds)
setInterval(updateDateTime, 1000);
const locationElement = document.querySelector(".location");
const dateElement = document.querySelector(".date");
const tempElement = document.querySelector(".current-temp");
const openCageApiKey = "3a21d953dd87459abd92b9890e52d0fb"; // Your API key

function updateDate() {
  const now = new Date();
  const options = { year: "numeric", month: "long", day: "numeric" };
  dateElement.textContent = now.toLocaleDateString(undefined, options);
}

async function fetchWeatherData() {
  try {
    // First, try to get the user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          // Use a reverse geocoding service to get the city and country
          const geoApiUrl = `https://api.opencagedata.com/geocode/v1/json?q=${latitude},${longitude}&key=3a21d953dd87459abd92b9890e52d0fb&language=en`;
          const geoResponse = await fetch(geoApiUrl);
          const geoData = await geoResponse.json();

          if (geoData.results && geoData.results.length > 0) {
            const city =
              geoData.results[0].components.city ||
              geoData.results[0].components.town ||
              geoData.results[0].components.village;
            const country = geoData.results[0].components.country;
            locationElement.textContent = `${city}, ${country}`;

            // Now fetch the weather data based on the coordinates
            const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&temperature_unit=celsius&timezone=Africa/Lagos`;
            const weatherResponse = await fetch(weatherApiUrl);
            const weatherData = await weatherResponse.json();

            if (
              weatherData.current &&
              weatherData.current.temperature_2m !== undefined
            ) {
              tempElement.textContent = `${weatherData.current.temperature_2m}°`;
            } else {
              tempElement.textContent = "Error";
            }
          } else {
            locationElement.textContent = "Location not found";
            tempElement.textContent = "Error";
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          locationElement.textContent = "Location access denied";
          tempElement.textContent = "Error";
          // Optionally, you could try a fallback to a default location or IP-based lookup here
        }
      );
    } else {
      locationElement.textContent = "Geolocation not supported";
      tempElement.textContent = "Error";
      // Optionally, you could try a fallback to a default location or IP-based lookup here
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    locationElement.textContent = "Error";
    tempElement.textContent = "Error";
  }
}

updateDate();
fetchWeatherData();

window.addEventListener("DOMContentLoaded", () => {
  fetch("https://the-automobile-management-system.onrender.com/")
    .then((response) => response.json())
    .then((data) => {
      console.log("Data received from backend:", data);

      // Access counts from the 'counts' property
      if (data.counts) {
        document.getElementById("customer-count").textContent =
          data.counts.max_customers ?? 0;
        document.getElementById("vehicle-count").textContent =
          data.counts.max_vehicles ?? 0;
        document.getElementById("service-count").textContent =
          data.counts.max_service_records ?? 0;
        document.getElementById("schedule-count").textContent =
          data.counts.max_schedules ?? 0;
        document.getElementById("mechanic-count").textContent =
          data.counts.max_mechanics ?? 0;
      } else {
        console.error("Counts data not found in response.");
        // Optionally set default values or display an error message on the page.
      }

      // Populate customer and vehicle table
      const customerVehicleTableBody = document
        .getElementById("customer-vehicle-table")
        .querySelector("tbody");
      customerVehicleTableBody.innerHTML = ""; // Clear existing rows

      if (data.customerData && Array.isArray(data.customerData)) {
        data.customerData.forEach((customer) => {
          const row = document.createElement("tr");
          row.innerHTML = `
                    <td>${customer.fname || ""}</td>
                    <td>${customer.lname || ""}</td>
                    <td>${customer.phone_number || ""}</td>
                    <td>${customer.email_address || ""}</td>
                    <td>${customer.make || ""}</td>
                    <td>${customer.model || ""}</td>
                    <td>${customer.year || ""}</td>
                `;
          customerVehicleTableBody.appendChild(row);
        });
      } else {
        console.error(
          "Customer data not found or is not an array in the response."
        );
        const noDataRow = document.createElement("tr");
        noDataRow.innerHTML = `<td colspan="7">No customer and vehicle data available.</td>`;
        customerVehicleTableBody.appendChild(noDataRow);
      }
    })
    .catch((err) => {
      console.error("Error fetching data:", err);
      const customerVehicleTableBody = document
        .getElementById("customer-vehicle-table")
        .querySelector("tbody");
      const errorRow = document.createElement("tr");
      errorRow.innerHTML = `<td colspan="7">Error loading customer and vehicle data.</td>`;
      customerVehicleTableBody.appendChild(errorRow);
    });
});

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const player = require('node-wav-player'); // Updated import
const say = require('say');

// List of users to monitor
const users = [
    {
        name: 'Sara',
        url: 'https://steamcommunity.com/profiles/76561199000322814/',
        previousStatus: ''
    },
    {
        name: 'Veeran',
        url: 'https://steamcommunity.com/id/ecksdee2017',
        previousStatus: ''
    }
];

// Create an Axios instance with a custom User-Agent
const axiosInstance = axios.create({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)'
    }
});

// Function to check each user's online status
async function checkStatuses() {
    for (const user of users) {
        try {
            const response = await axiosInstance.get(user.url);
            const html = response.data;
            const $ = cheerio.load(html);

            // Extract the status text
            const statusText = $('.profile_in_game_header').text().trim();

            // Get the current timestamp
            const timestamp = new Date().toISOString();

            // Create the log entry
            const logEntry = `${timestamp} - ${user.name} (${user.url}) - ${statusText}\n`;

            // Append the status to the log file
            fs.appendFile('status_log.txt', logEntry, (err) => {
                if (err) {
                    console.error('Error writing to log file:', err);
                }
            });

            // Output the status to the console
            console.log(logEntry);

            // Check if the status has changed
            if (statusText !== user.previousStatus) {
                // Play a chime sound and announce the status
                playChime();
                announceStatus(user.name, statusText);
                user.previousStatus = statusText;
            }

        } catch (error) {
            console.error(`Error fetching the profile page for ${user.name}:`, error);
        }
    }
}

// Function to play a chime sound without opening a media player
function playChime() {
    player.play({
        path: './getout.wav',
    }).catch((error) => {
        console.error('Error playing sound:', error);
    });
}

// Function to announce the status using text-to-speech
function announceStatus(name, status) {
    say.speak(`${name} is now ${status}`);
}

// Run the check immediately and then every 10 seconds
checkStatuses();
setInterval(checkStatuses, 10000); // 10000 milliseconds = 10 seconds

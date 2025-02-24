document.getElementById('drop-area').addEventListener('dragover', (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.target.classList.add('highlight');
});

document.getElementById('drop-area').addEventListener('dragleave', (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.target.classList.remove('highlight');
});

document.getElementById('drop-area').addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.target.classList.remove('highlight');
    const files = event.dataTransfer.files;
    handleFiles(files);
});

document.getElementById('fileElem').addEventListener('change', (event) => {
    const files = event.target.files;
    handleFiles(files);
});

let resumeFile;

function handleFiles(files) {
    resumeFile = files[0];
    const dropArea = document.getElementById('drop-area');
    dropArea.innerHTML = `<p>${resumeFile.name}</p>`;
}

async function startApplication() {
    const title = document.getElementById('title').value;
    const location = document.getElementById('location').value;
    const radius = document.getElementById('radius').value;
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;

    try {
        const jobs = await scrapeJobs(title, location, radius);
        for (const job of jobs) {
            await applyToJob(job, name, email, resumeFile);
        }
    } catch (error) {
        console.error('Error starting application:', error);
    }
}

async function scrapeJobs(titleFilter, locationFilter, radiusFilter) {
    const url = `https://au.jora.com/j?l=${encodeURIComponent(locationFilter)}&q=${encodeURIComponent(titleFilter)}&radius=${radiusFilter}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch jobs');
    }
    const text = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    const jobs = [];

    doc.querySelectorAll('.job').forEach(jobElement => {
        const title = jobElement.querySelector('.job-title').textContent;
        const location = jobElement.querySelector('.job-location').textContent;
        if (title.includes(titleFilter) && location.includes(locationFilter)) {
            const link = jobElement.querySelector('a').href;
            jobs.push({ title, location, link });
        }
    });

    return jobs;
}

async function applyToJob(job, name, email, resumeFile) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('resume', resumeFile);

    const response = await fetch(job.link, {
        method: 'POST',
        body: formData
    });

    if (response.ok) {
        console.log(`Applied to job: ${job.title}`);
    } else {
        console.error(`Failed to apply to job: ${job.title}`);
    }
}

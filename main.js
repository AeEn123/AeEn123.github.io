async function fetchAllFilesFromRepo(url) {
    const contentsResponse = await fetch(url);
    const contents = await contentsResponse.json();
    
    let files = [];

    for (const item of contents) {
        if (item.type === 'file') {
            if (item.name.endsWith('.py') || item.name.endsWith('.rs') || item.name.endsWith('.js')) {
                files.push(item);
            }
        } else if (item.type === 'dir') {
            const subDirFiles = await fetchAllFilesFromRepo(item.url);
            files = files.concat(subDirFiles);
        }
    }

    return files;
}

async function setBackground(repos) {
    const filteredRepos = repos.filter((repo) =>
        repo.name != "A-test-repository" || repo.name != "channel-logo"
    )

    const randomRepo = filteredRepos[Math.floor(Math.random() * filteredRepos.length)];
    
    console.log(randomRepo)
    const files = await fetchAllFilesFromRepo(`https://api.github.com/repos/AeEn123/${randomRepo.name}/contents`);

    if (files.length === 0) {
        console.error('No valid files found in the repository.');
        return;
    }

    const randomFile = files[Math.floor(Math.random() * files.length)];
    
    const fileResponse = await fetch(randomFile.download_url);
    const fileContent = await fileResponse.text();
    
    document.getElementById("background").textContent = fileContent
}

async function setRepos(repos) {
    const div = document.getElementById("repos")
    let html = ""
    repos.forEach((repo) => {
        console.log(repo)
        html += `
        <section>
            <a href="${repo.html_url}"><h1>${repo.name}</h1></a>`

        if (repo.fork) {
            html += "<i>forked from another repo</i>"
        }

        if (repo.homepage) {
            html += `<a href="${repo.homepage}">${repo.homepage}</a>`
        }

        html += `
            <p>${repo.description}</p>
        </section>`


    })
    div.innerHTML += html
}

async function githubContent() {
    const response = await fetch('https://api.github.com/users/AeEn123/repos');
    const temp = await response.json();
    if (!Array.isArray(temp)) {
        console.error('Unexpected response format:', repos);
        return;
    }

    const repos = temp.sort((a, b) => b.stargazers_count - a.stargazers_count)
    setRepos(repos)
    setBackground(repos)   

}

function update(event) {
    const background = document.getElementById("background");
    background.style.left = `${-window.scrollX}px`;
    background.style.top = `${-window.scrollY}px`;
}

setInterval(function() {
    var now = new Date();
    var ukTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/London"}));
    document.getElementById("time").innerHTML = "My time zone is GMT (UK Time) - " + ukTime.toLocaleString();
}, 1000)

githubContent()
document.addEventListener('scroll', event => update(event));
document.addEventListener("DOMContentLoaded", function() {
    fetchRepositories();
    updateFooterYear();
});

async function fetchRepositories() {
    const hiddenRepos = ["SharkRDP", "Windows-CRD", "WindowsCRD", "aglsk"]; // Repositórios a serem ocultados

    try {
        const response = await fetch("https://api.github.com/users/aglsk/repos");
        if (!response.ok) {
            throw new Error(`Erro ao carregar repositórios: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

        const repoGrid = document.getElementById("repositories");

        // Filter repositories before fetching images
        const visibleRepos = data.filter(repo => !hiddenRepos.includes(repo.name));
        
        // Fetch background images in parallel
        const repoDetailsPromises = visibleRepos.map(repo => getBackgroundImage(repo));
        const repoDetailsArray = await Promise.all(repoDetailsPromises);

        // Add repos to the DOM
        repoDetailsArray.forEach(repoDetails => {
            const card = document.createElement("div");
            card.classList.add("col");

            const cardContent = `
                <div class="card repo-card shadow">
                    <img src="${repoDetails.background_image}" class="card-img-top repo-bg-image" alt="Background Image">
                    <div class="card-body">
                        <h5 class="card-title repo-name">${repoDetails.repo_name}</h5>
                    </div>
                </div>
            `;
            card.innerHTML = cardContent;

            card.addEventListener("click", function() {
                window.open(repoDetails.html_url, "_blank");
            });

            repoGrid.appendChild(card);
        });

    } catch (error) {
        console.error("Erro ao buscar repositórios:", error);
        const repoGrid = document.getElementById("repositories");
        repoGrid.innerHTML = "<p>Ocorreu um erro ao carregar os repositórios. Por favor, tente novamente mais tarde.</p>";
    }
}

async function getBackgroundImage(repo) {
    try {
        const response = await fetch(`https://raw.githubusercontent.com/aglsk/${repo.name}/main/inforepo.json`);
        if (!response.ok) {
            throw new Error(`Erro ao carregar imagem de fundo para o repositório ${repo.name}: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return {
            background_image: data.background_image,
            repo_name: data.repo_name || repo.name,
            html_url: repo.html_url // Added this to pass the URL along with the details
        };
    } catch (error) {
        console.error(`Erro ao buscar imagem de fundo para o repositório ${repo.name}:`, error);
        return {
            background_image: "https://salonlfc.com/wp-content/uploads/2018/01/image-not-found-1-scaled-1150x647.png",
            repo_name: repo.name,
            html_url: repo.html_url // Added this to ensure the fallback still has the repo URL
        };
    }
}

function updateFooterYear() {
    const currentYear = new Date().getFullYear();
    document.getElementById("year").textContent = currentYear;
}

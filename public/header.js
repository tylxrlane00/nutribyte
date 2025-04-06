const headerTemplate = document.createElement("template");
headerTemplate.innerHTML = `
<header style="background-color:rgb(252, 254, 217)">
		
		<table>
			<tbody>
				<tr>
					<td>
						<div style="display: flex; align-items: center; gap: 1.5rem;">
						<a href="/"><img src="/images/logo.svg" alt="Logo - NutriByte" width="100" /></a>
						<nav class="nav-buttons">
							<button onclick="window.location.href='/'">Home</button>
							<button onclick="window.location.href='/htmls/search.html'">Search</button>
							<button onclick="window.location.href='/htmls/compare.html'">Compare</button>
						</nav>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
			
	</header>`;

class Header extends HTMLElement {
  constructor() {
    super();
  }


  // browser calls this method when the element is added to the document
  connectedCallback() {
    const shadowRoot = this.attachShadow({ mode: "open" }); //attach shadow DOM
    shadowRoot.appendChild(headerTemplate.content);
  }
}

customElements.define("header-component", Header);

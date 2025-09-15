
function carregarDados(){
    let divisao = document.querySelector("#product-list")
        divisao.innerHTML += "<ol>"
        fetch("prod.json").then((response) =>{
            response.json().then((prod)=>{
            prod.products.map((produto) =>{
                divisao.innerHTML+="<il> {"
                +produto.id+" , "
                +produto.name+" , "
                +produto.price+" , "
                +produto.category+" , "
                +produto.image+" } </li>"
                console.log(produto.id);
                console.log(produto.name);
                console.log(produto.price);
                console.log(produto.category);
                console.log(produto.image);});
            

            });

        })

        divisao.innerHTML += "</ol>"

}

window.addEventListener("load", carregarDados);
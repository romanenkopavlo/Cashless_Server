export const products = (req, res) => {
    console.log("dans les products")
    res.status(200).json({allProductsResponse: [
            {name: "Coca", amount: 888, price: 3.5},
            {name: "Fries", amount: 555, price: 3.5},
            {name: "Burgers", amount: 333, price: 5.5},
            {name: "Vodka", amount: 999, price: 0.02},
            {name: "Jaëgermeister", amount: 666, price: 5}
        ]});
}
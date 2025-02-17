import User from "../models/user.js";
import {generateTokens} from "../utils/jwtUtil.js";

const users = []

export const login = (req, res) => {
    const {login, mdp} = req.body;
    console.log(login, mdp)
    const uuid = crypto.randomUUID()
    if (login === "admin" && mdp === "admin") {
        const user = new User(1, uuid, login, mdp, "admin")
        const tokens = generateTokens(user);
        user.setRefreshToken(tokens.refreshToken);
        users.push(user);

        // res.cookie('refreshToken', tokens.refreshToken, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === 'production'
        // })

        // console.log(res.getHeaders());

        res.json({accessToken: tokens.accessToken});
    } else if (login === "user" && mdp === "user") {
        const user = new User(1, uuid, login, mdp, "user")
        const tokens = generateTokens(user);
        user.setRefreshToken(tokens.refreshToken);
        users.push(user);

        // res.cookie('refreshToken', tokens.refreshToken, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === 'production'
        // })

        // console.log(res.getHeaders());

        res.json({accessToken: tokens.accessToken});
    }
}

export const products = (req, res) => {
    res.json({name: "coca-cola", price: 2.5, amount: 8000}, {name: "fries", price: 1.5, amount: 90000})
}

export const checkCard = (req, res) => {
    console.log(req.body)
    const {tag} = req.body
    console.log(tag)
    const regex = /^([0-9A-Fa-f]{2}:){6}[0-9A-Fa-f]{2}$/
    if (regex.test(tag)) {
        res.status(200).json({message: 'Valid card number'});
    } else {
        res.status(401).json({message: 'Invalid card number'});
    }
}
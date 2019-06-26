require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const POKEDEX = require('./pokedex.json');
const cors = require('cors');
const helmet = require('helmet');


const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))
app.use(cors());
app.use(helmet());

app.use(function validateBearerToken(req, res, next) {

    const authToken = req.get('Authorization');
    const apiToken = process.env.API_TOKEN;
    if(!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({error: 'Unauthorized request'})
    }
    next();
});

const validTypes = ['Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting', 'Fire', `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`];

function handleGetTypes(req, res) {
    res.json(validTypes);
}
app.get('/types', handleGetTypes);

function handleGetPokemon(req, res) {
    const {name, type } = req.query;
    const pokedex = POKEDEX;
    function upperFirst(str) {
        str = str.toLowerCase();
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    let result = [];
    
    if(type) {
        let pType = upperFirst(type);
        if (!validTypes.includes(pType)) {
            return res.status(400).json({error: 'Please select a valid type'})
        }
        else {
            for (let i = 0; i < pokedex.pokemon.length; i++) {
                if (pokedex.pokemon[i].type.includes(pType)) {
                    result.push(pokedex.pokemon[i]);
                }
            }
        }
    }
    if(name) {
        let pName = name.toLowerCase();
        for (let i = 0; i < pokedex.pokemon.length; i++) {
            if (pokedex.pokemon[i].name.toLowerCase().includes(pName)) {
                result.push(pokedex.pokemon[i]);
            }
        }
    }
    res.json(result);
}
app.get('/pokemon', handleGetPokemon);

app.use((error, req, res, next) => {
    let response 
    if(process.env.NODE_ENV === 'production') {
        response = { error: { message: 'server error' }}
    }
    else {
        response = { error }
    }
    res.status(500).json(response)
})
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
});

const express = require('express')
const crypto = require('node:crypto')
const cors = require('cors')
const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./schema/movies')


const app = express()
app.use(express.json()) //Para pasar bien los json
app.use(cors({
    origin:(origin,callback) =>{
        const ACCEPTED_ORIGIN = [
            'http://127.0.0.1:5500'
        ]
        if(ACCEPTED_ORIGIN.includes(origin)){
            return callback(null,true)
        }
        if(!origin){
            return callback(null,true)
        }
        return callback(new Error('Not allowed by CORS'))
    }
})) // middleware para el cors
// app.use(cors())
app.disable('x-powered-by')  // deshabilitar el header X-powered-By

//Para el cors con el delete de forma manual sin instalar cors
// app.options('movies/:id',(req,res) =>{
//     console.log("Entre al options");
//     const origin = req.header('origin')
//     // if(ACCEPTED_ORIGIN.includes(origin)|| !origin){
//         res.header('Access-Control-Allow-Origin','*')
//         res.header('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE')
//     // }
//     res.send(200)
// })
//Todos los recursos movies
app.get('/movies', (req, res) => {
    // const origin = req.header('origin')
    // if(ACCEPTED_ORIGIN.includes(origin) || !origin){
    //     res.header('Access-Control-Allow-Origin', origin)
    // }
    const {genre} = req.query
    if(genre){
        // const filteredMovies = movies.filter(
        //     movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        // )
        const filteredMovies = movies.filter(
            movie => movie.genre.toLowerCase() === genre.toLocaleLowerCase()
        )
        return res.json(filteredMovies)
    }
    res.json(movies)
})

//Pelicula por id
app.get('/movies/:id', (req, res) =>{
    const {id} = req.params
    debugger;
    const movie = movies.find(movie => movie.id == id)
    if(movie){
        return res.json(movie)
    }
    res.status(404).json({message: "Movies not found"})
});

//Agregar una pelicula
app.post('/movies', (req, res) =>{
    const resultMovie = validateMovie(req.body)
    if(resultMovie.error){
        return res.status(400).send({error: JSON.parse(resultMovie.error.message)})
    }
    const newMovie ={
        id: crypto.randomUUID(),
        ...resultMovie.data
    }
    movies.push(newMovie)
    res.status(201).json(newMovie)
});
//Actualizar una pelicula
app.patch('/movies/:id', (req, res) =>{
    const resultMovie = validatePartialMovie(req.body)
    if(resultMovie.error){
        return res.status(400).json({error: JSON.parse(resultMovie.error.message)})
    }
    const {id} = req.params
    const movieIndex = movies.findIndex(movie => movie.id == id)
    if(movieIndex === -1){
        return res.status(404).json({message: "Movie not found"})
    }
    const updateMovie = {
        ...movies[movieIndex],
        ...resultMovie.data
    }
    movies[movieIndex] = updateMovie
    return res.json(updateMovie)

})

//Borrar una pelicula
app.delete('/movies/:id',(req,res) =>{
    // console.log('Entre a delete')
    // res.header('Access-Control-Allow-Origin','*')
    // res.header('Access-Control-Allow-Methods','GET,POST,PATCH,DELETE')
    // const origin = req.header('origin')
    // if(ACCEPTED_ORIGIN.includes(origin) || !origin){
    //     res.header('Access-Control-Allow-Origin', origin)
    // }
    const {id} = req.params
    const movieIndex = movies.findIndex(movie => movie.id == id)

    if(movieIndex == -1){
        return res.status(404).json({mesagge : "Pelicula no encontrada"})
    }
    movies.splice(movieIndex,1)
    
    return res.json({message: 'Pelicula eliminada'})
})

const PORT = process.env.PORT ?? 1234

app.listen(PORT, (req, res) => {
    console.log(`listening on port http://localhost:${PORT}`);
})

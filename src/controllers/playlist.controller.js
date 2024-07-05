import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist

    const {name, description} = req.body


    if(!(name || description)){
        throw new ApiError(400, "Name or Description is empty, Both are required!")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    if(!playlist){
        throw new ApiError(500, "Failed to create playlist, please try again!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist created successfully!")
    )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    //TODO: get user playlists

    const {userId} = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(401, "Invalid User ID!")
    }

    const playlist = await Playlist.find({owner: userId})

    if(!playlist.length){
        throw new ApiError(404, "No playlist found!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "User playlists fetched successfully!")
    )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    //TODO: get playlist by id

    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(401, "Invalid playlist ID!")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "Playlist not found!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist fetched successfully!")
    )

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {

    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(401, "Invalid playlist ID or video ID!")
    }

    const video = await Playlist.findOne({videos: videoId})


    if(video){
        throw new ApiError(404, "Video already added to the playlist!")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $push: {videos: videoId}
        },
        {new: true}
    )

    if(!playlist){
        throw new ApiError(500, "Failed to add video to playlist, please try again!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Video added to playlist successfully!")
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // TODO: remove video from playlist
    
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(401, "Invalid playlist ID or video ID!")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {videos: videoId}
        },
        {new: true}
    )

    if(!playlist){
        throw new ApiError(500, "Failed to remove video from playlist, please try again!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Video remove from playlist successfully!")
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    // TODO: delete playlist

    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(401, "Invalid playlist ID!")
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist deleted successfully!")
    )

})

const updatePlaylist = asyncHandler(async (req, res) => {
    //TODO: update playlist

    const {playlistId} = req.params
    const {name, description} = req.body

    if(!isValidObjectId(playlistId)){
        throw new ApiError(401, "Invalid playlist ID!")
    }

    if(!name || !description){
        throw new ApiError(400, "Name and Description is required!")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            name,
            description
        },
        {new: true}
    )

    if(!playlist){
        throw new ApiError(500, "Failed to update playlist informatin!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist information updated successfully!")
    )

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}

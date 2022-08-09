import { createSlice } from "@reduxjs/toolkit";
import { API, API_URL } from "../../api/constAPI";

const initialState = {
   rooms: [], 
   isLoading: false
}

const roomSlice = createSlice({
   name: 'rooms',
   initialState,
   reducers: {
      fetchRoomDataAction(state, action){
         state.isLoading = true;
      },
      fetchRoomDataSuccess(state, action){
         state.rooms = action.payload;
         state.isLoading = false;
         console.log(action.payload)
      },
      fetchRoomDataFail(state, action){
         
      }, 
      
      updateRoomTypeInfo ( state, action){
         const roomInfoChange = action.payload;
         API.patch(`${API_URL}/rooms/`, roomInfoChange.id, roomInfoChange)
         state.rooms.forEach( (item, index) => {
            if( item.id === roomInfoChange.id){
               state.rooms.splice(index, 1, roomInfoChange)
            }
         })
      },
      deleteRoomType (state, action) {
         API.delete(`${API_URL}/rooms/`, action.payload);
         state.rooms.forEach( (item, index) => {
            if( item.id === action.payload){
               state.rooms.splice(index, 1)
            }
         })
      },
      addNewRoomType (state, action) {
         state.rooms = [...state.rooms, action.payload]
      },
      updateRoomsAction (state, action) {
         console.log('Update rooms: ', action.payload)
         state.isLoading = true;
      }
   }
})

export const {
   fetchRoomDataAction,
   fetchRoomDataSuccess,
   fetchRoomDataFail,
   updateRoomTypeInfo,
   deleteRoomType,
   addNewRoomType,
   updateRooms,
   updateRoomsAction
} = roomSlice.actions;

export const roomReducer = roomSlice.reducer;


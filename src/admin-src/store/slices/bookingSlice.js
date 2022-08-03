import { createSlice } from "@reduxjs/toolkit";

const initialState = {
   bookings: [],
   currentRoomSelection: '',
   roomArrangement: [],
   isLoading: false
}

const bookingSlice = createSlice({
   name: "booking",
   initialState,
   reducers :{
      fetchBookingDataAction (state, action) {
         state.isLoading = true;
      },
      fetchBookingActionSuccess( state, action) {
         state.bookings = action.payload;
         state.isLoading = false;
      },
      // saveCurrentRoomSelectionAction (state, action){
      //    state.currentRoomSelection = action.payload;
      // },
      updateBookingAction (state, action) {
         state.isLoading = true;
      },
      // resetCurrentRoomSelectionAction (state, action){
      //    state.currentRoomSelection = ''
      // }
   }
})

export const {
   fetchBookingDataAction,
   fetchBookingActionSuccess,
   // saveCurrentRoomSelectionAction,
   updateBookingAction,
   // resetCurrentRoomSelectionAction,
} = bookingSlice.actions;

export const bookingReducer = bookingSlice.reducer;
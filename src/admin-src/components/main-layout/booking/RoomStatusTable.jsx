import { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';

import '../../../style/RoomStatusTable.scss'
import { fetchRoomDataAction } from '../../../store/slices/roomSlice'
import { fetchBookingDataAction } from '../../../store/slices/bookingSlice'
import ShowRoom from "./ShowRoom";
import { Loading } from "../../shared-components/Loading";

export default function RoomStatusTable () {
   const dispatch = useDispatch()
   const rooms = useSelector(state => state.roomReducer.rooms)
   const isRoomsLoading = useSelector(state => state.roomReducer.isLoading) 
   const roomDefinition = ['Available', 'Active', 'Busy']

   useEffect(() => {
      dispatch(fetchRoomDataAction())
   }, []);

   return (
      <div className="roomStatus">
         <div className="bookingHeader">
            <div className="definition-container">
               {roomDefinition.map((item, index) => (
                  <div key={index} className="definition">
                     <div className={`definitionColor ${item}`}></div>
                     <span>{item}</span>
                  </div>
               ))}
            </div>
         </div>

         {isRoomsLoading? (
            <Loading />
         ):(
            <div className="bookingContent">
               {rooms.map((roomsGroup, index) => (
                  <div className="typeGroup" key={index}>
                     <ShowRoom roomsGroup={roomsGroup}/>
                  </div>
               ) )}
            </div>
         )}
      </div>
   )
}
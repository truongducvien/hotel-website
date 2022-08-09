import { useState, useEffect } from 'react'
import { Button, Modal } from 'antd';
import { API, API_URL } from '../../../api/constAPI';

import { useDispatch } from 'react-redux';
import { updateRoomsAction } from '../../../store/slices/roomSlice'

import '../../../style/ShowRoom.scss'

export default function ShowRoom ({ roomsGroup }){
   const [isModalVisible, setIsModalVisible] = useState(false);
   const [infoShow, setInfoShow] = useState('');
   const dispatch = useDispatch();

   const handleClick = (room) => {
      setIsModalVisible(true)
      setInfoShow(room)
   }

   const changeRoomStatus = (status) => {
      const roomTypeId = roomsGroup.id;
      
      if(window.confirm(`Set status of ${infoShow.roomName} to: ${status}?`)){
         API.get(`${API_URL}/rooms/${roomTypeId}`).then(res => {
            res.data.roomsList.forEach( room => {
               if(room.id === infoShow.id){
                  room.roomStatus = status;
               }
            })
            dispatch(updateRoomsAction(res.data));
            setIsModalVisible(false)
         })
      }
   }

   const handleBusy = () => {
      changeRoomStatus('busy')
   }

   const handleAvailable = () => {
      changeRoomStatus('available')
   }

   const handleOk = () => {
      setIsModalVisible(false)
   }

   const handleCancel = () => {
      setIsModalVisible(false)
   }

   useEffect(() => {
      console.log('render showRooms components');
   })

   return (
      <>
         <span className="typeTitle">{roomsGroup.typeRoom}</span>
         <div className="room-group">
            {roomsGroup.roomsList.map( room => (
               <div 
                  className={`room ${room.roomStatus}`}
                  key={room.id} 
                  onClick={() => handleClick(room)}
               >
                  <p>{room.roomName}</p>
               </div>
            ))}
         </div>

         {infoShow &&
            <Modal 
               className='rooms-modal'
               title="Booking Information:" 
               visible={isModalVisible} 
               onOk={handleOk} 
               onCancel={handleCancel}
               footer={[
                  infoShow.roomStatus === 'available'? (
                     <Button className='rooms-modal-btn set-status-btn' key='setBusy' onClick={handleBusy}>Set Busy</Button>
                  ): null,
                  infoShow.roomStatus === 'busy'? (
                     <Button className='rooms-modal-btn set-status-btn' key='setAvailable' onClick={handleAvailable}>Set Available</Button>
                  ): null,
                  <Button className='rooms-modal-btn' key='cancel' onClick={handleCancel}>Cancel</Button>,
                  <Button className='rooms-modal-btn' key='ok' onClick={handleOk}>OK</Button>
               ]}
            >
               {infoShow.currentBooking.bookingId !== ''? (
                  <>
                     <p>Booking ID: {infoShow.currentBooking.bookingId}</p>
                     <p>Customer: {infoShow.currentBooking.userFullName}</p>
                  </>
               ):(
                  <h2>No data</h2>
               )}
            </Modal>
         }
      </>
   )
}

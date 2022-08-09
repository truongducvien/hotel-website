import { useState, useEffect } from "react";
import { useParams, NavLink, useNavigate } from "react-router-dom"
import { API, API_URL } from "../../../api/constAPI";
import { useSelector, useDispatch } from "react-redux"

import moment from 'moment'
import { Table, Space, Modal, Button } from "antd";

import { Loading } from "../../shared-components/Loading";

import '../../../style/BookingDetail.scss';
import { fetchBookingDataAction, updateBookingAction} from '../../../store/slices/bookingSlice';
import { fetchRoomDataAction, updateRoomsAction } from '../../../store/slices/roomSlice'
import ShowAvailableRooms from "./ShowAvailableRooms"; 
import BookingReport from "./BookingReport";

export default function BookingDetail () {
   const { bookingId } = useParams()
   const navigate = useNavigate()
   const dispatch = useDispatch();
   const rooms = useSelector(state => state.roomReducer.rooms)
   const bookings = useSelector(state => state.bookingReducer.bookings)
   const isBookingLoading = useSelector(state => state.bookingReducer.isLoading)

   const [booking, setBooking] = useState()
   const [bookingOptions, setBookingOptions] = useState()

   const [isRoomModalVisible, setIsRoomModalVisible] = useState(false);
   const [availableRooms, setAvailableRooms] = useState([])

   const [currentTypeSelection, setCurrentTypeSelection] = useState('');
   const [currentRoomSelection, setCurrentRoomSelection] = useState('');

   const [isBookingReportVisible, setIsBookingReportVisible] = useState(false)


   useEffect(() => {
      API.get(`${API_URL}/bookings/${bookingId}`).then(res => setBooking(res.data))
   }, [bookings]); 

   useEffect(() => {
      dispatch(fetchRoomDataAction())
      dispatch(fetchBookingDataAction());
   }, [])

   useEffect(() => {
      if(booking){
         const optionTable = booking.options.map( opt => {
            return {
               key: opt.id,
               bookingId: booking.id,
               typeRoom: opt.typeRoom,
               roomTypeId: opt.typeRoomId,
               roomName: opt.roomName,
               adultCount: opt.adult,
               childrenCount: opt.children,
               status: opt.status
            }
         })
         setBookingOptions(optionTable)
      }
   }, [booking]);

   const updateRooms  = ( status, roomTypeId, roomId, bookingId, userFullName) => {
      API.get(`${API_URL}/rooms/${roomTypeId}`).then(res => {
         res.data.roomsList.forEach( room => {
            if(room.id === roomId){
               room.roomStatus = status;
               room.currentBooking.bookingId = bookingId;
               room.currentBooking.userFullName = userFullName;
            }
         })
         dispatch(updateRoomsAction(res.data))
      })
   }

   const updateBookings = (bookingStatus, roomName, bookingId, optionId) => {
      API.get(`${API_URL}/bookings/${bookingId}`).then( res => {
         res.data.options.forEach( item => {
            if(item.id === optionId){
               item.roomName = roomName;
               item.status = bookingStatus;
            }
         })
         dispatch(updateBookingAction(res.data))
      })
   }

   // Filter all the current available rooms everytime rooms changed:
   useEffect(()=> {
      const availableRoomsFilter = rooms.map( room => {
         return {
            roomTypeId: room.id,
            roomType: room.typeRoom,
            available: room.roomsList.filter( item => item.roomStatus === 'available')
         }
      })
      setAvailableRooms(availableRoomsFilter)
   },[rooms])

   // CLear current Room/Type selection when close the room modal:
   useEffect(() => {
      if(!isRoomModalVisible) {
         setCurrentRoomSelection('');
         setCurrentTypeSelection('');
      }
   }, [isRoomModalVisible])


   // When click OK from choose room box, update roomStatus and bookingStatus:
   const handleOk = () => {
      if(currentRoomSelection){
         setIsRoomModalVisible(false);

         // Update change in rooms & bookings data:
         let roomTypeId = currentTypeSelection.roomTypeId;
         let optionKey = currentTypeSelection.key;
         let roomId = currentRoomSelection.id;
         let roomName = currentRoomSelection.roomName;
         let userFullName = `${booking.userInfo.firstName} ${booking.userInfo.lastName}`;
         
         updateRooms('active', roomTypeId, roomId, bookingId, userFullName)
         updateBookings ('Checked-in', roomName, bookingId, optionKey)
      } else {
         alert ('Please choose a room!')
      }
   };

   const handleCancel = () => {
      setIsRoomModalVisible(false);
   };

   const handleClickCheckIn = (record) => { 
      const now = moment()._d.getTime()
      const startDay = booking.date.startDay;

      if(startDay + 43199000 < now){
         if(window.confirm("This booking is expired, note Expired?")) {
            updateBookings ('Expired', "", bookingId, record.key)
         }
      } else if( startDay > now) {
         alert(`Can't check-in before ${moment(startDay).format("MMMM Do YYYY h:mm:ss a")}!`)
      } else{
         setCurrentTypeSelection(record)
         setIsRoomModalVisible(true);
      }  
   }

   const handleClickCheckOut = (record) => {
      let bookingId = record.bookingId;
      let optionId = record.key;
      let roomTypeId = record.roomTypeId;

      if(window.confirm(`Check out of ${record.roomName}?`)){
         let roomId;
         rooms.forEach( roomType => {
            if( roomType.id === roomTypeId){
               roomType.roomsList.forEach( item => {
                  if ( item.roomName === record.roomName){
                     roomId = item.id;
                  }
               })
            } 
         })
         updateRooms('available', roomTypeId, roomId, "", "")
         updateBookings ('Checked-out', "", bookingId, optionId)
      }
   }

   const showBookingReport = () => { setIsBookingReportVisible(true) }

   const handleReportPrint = () => {
      if(window.confirm('Print this report?')) {
         setIsBookingReportVisible(false)
         navigate('../booking_management')
      }
   }

   const handleReportCancel = () => { setIsBookingReportVisible(false) }

   const handleEndBooking = () => {
      if(booking.options.some( opt => opt.status === 'Checked-in')){
         alert('This booking is currently active. Check-out all rooms before ending booking!')
      } else {
         if (window.confirm('End this booking?')){
            showBookingReport()

            API.get(`${API_URL}/bookings/${bookingId}`).then( res => {
               res.data.status = 'Finished'
               dispatch(updateBookingAction(res.data))
            })
         }
      }
   }


   const optionColumns = [
      {
         title: 'Index',
         dataIndex: "index",
         key: 'index',
         render: (item, obj, index) => (
            <div style={{textAlign: 'center'}}>{index + 1}</div>
         )
      },
      {
         title: 'Room Type',
         dataIndex: 'typeRoom',
         key: 'typeRoom',
         render: (item) => (
            <div style={{textAlign: 'center'}}>{item}</div>
         )
      },
      {
         title: 'Room name',
         dataIndex: 'roomName',
         key: 'roomName',
         render: (item) => (
            <div style={{textAlign: 'center'}}>{item}</div>
         )
      },
      {
         title: 'Adult',
         dataIndex: 'adultCount',
         key: 'adultCount',
         render: (item) => (
            <div style={{textAlign: 'center'}}>{item}</div>
         )
      },
      {
         title: 'Children',
         dataIndex: 'childrenCount',
         key: 'childrenCount',
         render: (item) => (
            <div style={{textAlign: 'center'}}>{item}</div>
         )
      },
      {
         title: 'Status',
         dataIndex: 'status',
         key: 'status',
         render: (text) => (
            <div className="statusCell" style={{textAlign: 'center'}}>
               {<><i className={`fa-solid fa-circle status ${text}`}></i><span>{text}</span></>}
            </div>
         )
      },
      {
         title: 'Action',
         key: 'action',
         render: (_, record) => (
            <div style={{textAlign: 'center'}}>
               <Space size="middle">
                  {record.status === 'Booked' &&
                     <button 
                        className="changeStatusButton"
                        onClick={() => handleClickCheckIn(record)} 
                     >Check-in</button>
                  }

                  {record.status === 'Checked-in' &&
                     <button
                        className="changeStatusButton"
                        onClick={() => handleClickCheckOut(record)}
                     >Check-out</button>
                  }
               </Space>
            </div>
         ),
      },
   ]


   return (
      <div className="bookingDetail">
         <div className='backButton-container'>
            <NavLink className='backButton' to='../booking_management'>
               <i className="fa-solid fa-arrow-left"></i>
            </NavLink>
         </div>

         {!booking? (<Loading />) : (
            <div className="detailContent">
               <div className="userContentTitle">User detail: </div>
      
               <div className="userInfo">
                  <div className="userInfo-group">
                     <span>User ID:</span>
                     <p>{booking.userInfo.id}</p>
                  </div>
      
                  <div className="userInfo-group">
                     <span>User name:</span>
                     <p>{booking.userInfo.firstName} {booking.userInfo.lastName}</p>
                  </div>
      
                  <div className="userInfo-group">
                     <span>Phone number:</span>
                     <p>{booking.userInfo.phone}</p>
                  </div>
      
                  <div className="userInfo-group">
                     <span>E-mail:</span>
                     <p>{booking.userInfo.email}</p>
                  </div>
      
                  <div className="userInfo-group">
                     <span>Arrival time:</span>
                     <p>{booking.userInfo.arrivalTime}</p>
                  </div>
               </div>
      
               <div className="bookingInfo">
                  <div className="bookingInfo-group">
                     <span>Payment:</span>
                     <p>{booking.payment.method}</p>
                  </div>
      
                  <div className="bookingInfo-group">
                     <span>Start day:</span>
                     <p>{moment(booking.date.startDay).format("MMMM Do YYYY")}</p>
                  </div>
      
                  <div className="bookingInfo-group">
                     <span>End day:</span>
                     <p>{moment(booking.date.endDay).format("MMMM Do YYYY")}</p>
                  </div>

                  <div className="userInfo-group">
                     <span>Request:</span>
                     <p className="bookingRequest">{booking.userInfo.requests}</p>
                  </div>
               </div>

               <div className="bookingOption">
                  <div className="bookingOptionTitle">Booking detail:</div>

                  {isBookingLoading? (
                     <Loading />
                  ):(
                     bookingOptions &&
                        <Table 
                           className="bookingOptionTable"
                           columns={optionColumns} 
                           dataSource={bookingOptions} 
                           size='small'
                           pagination={false}
                        />
                  )}
               </div>

               <button className="endBookingButton" onClick={handleEndBooking}>End booking</button>
            </div>
         )}

         <Modal 
            title="Choose room:" 
            visible={isRoomModalVisible} 
            onOk={()=>handleOk()} 
            onCancel={handleCancel}
         >
            <ShowAvailableRooms 
               availableRooms={availableRooms}
               currentTypeSelection={currentTypeSelection} 
               currentRoomSelection={currentRoomSelection}
               setCurrentRoomSelection={setCurrentRoomSelection} 
            />
         </Modal>
      
         <Modal
            className="bookingReportModal"
            title='Booking report:'
            visible={isBookingReportVisible} 
            onCancel={handleReportCancel}
            footer={[
               <Button className="bookingReportButton" key='cancel' onClick={handleReportCancel}>Cancel</Button>,
               <Button className="bookingReportButton printButton" key='print' onClick={handleReportPrint}>Print</Button>,
            ]}
         >
            <BookingReport booking={booking}/>
         </Modal>
      </div>
   )
}
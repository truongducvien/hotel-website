import { call, delay, put, takeEvery } from 'redux-saga/effects'
import { 
   fetchRoomDataAction,
   fetchRoomDataSuccess,
   updateRoomsAction
} from '../slices/roomSlice'

import { API, API_URL } from '../../api/constAPI'

const RoomDataURL = `${API_URL}/rooms`


function getRoomsFromAPI () {
   return fetch(RoomDataURL).then( res => res.json())
}

function* fetchRoomData () {
   try{ 
      const data = yield call(getRoomsFromAPI)
      yield delay(1000)
      yield put(fetchRoomDataSuccess(data))
   }catch (e) {
      console.log("Error: ", e)
   }
}

function patchData (change){
   API.patch(`${API_URL}/rooms`, change.payload.id, change.payload)
} 

function* updateRooms (change) {
   try {
      yield call(patchData, change)
      yield delay(500)
      yield call(fetchRoomData)
   } catch (e){
      console.log("Error: ", e)
   }
}

export function* roomSaga () {
   yield takeEvery(fetchRoomDataAction, fetchRoomData)
   yield takeEvery( updateRoomsAction, updateRooms )
} 
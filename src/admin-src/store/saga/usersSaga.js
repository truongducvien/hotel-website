import { call, put, delay, takeEvery } from "redux-saga/effects";
import { API, API_URL } from '../../api/constAPI'

import { 
   fetchUsersDataAction,
   fetchUsersDataSuccess,
   deleteUserDataAction,
   updateUserDataAction } from '../slices/usersSlice'

function getUsersDataFromAPI (){
   return API.get(`${API_URL}/users`).then(res => res.data)
}

function* fetchUsersData () {
   try{
      const data = yield call(getUsersDataFromAPI);
      yield delay(500);
      yield put(fetchUsersDataSuccess(data))
   } catch (e) {
      console.log("Error: ", e)
   }
}


function deleteUserById(id) {
   API.delete(`${API_URL}/users`, id)
}

function* deleteUserData (change) {
   try{
      yield call(()=>deleteUserById(change.payload))
      yield delay(200)
      yield call(fetchUsersData)
   } catch (e) {
      console.log("Error: ", e)
   }
}


function updateUserById (change) {
   console.log(change)
   const id = change.id;
   API.patch(`${API_URL}/users`, id, change)
}

function* updateUserData (change) {
   try{
      yield call(()=>updateUserById(change.payload))
      yield delay(500)
      yield call(fetchUsersData)
   } catch (e) {
      console.log("Error: ", e)
   }
}

export function* usersSaga () {
   yield takeEvery(fetchUsersDataAction, fetchUsersData)
   yield takeEvery(deleteUserDataAction, deleteUserData)
   yield takeEvery(updateUserDataAction, updateUserData)
}
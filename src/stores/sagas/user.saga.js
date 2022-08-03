import { notification } from "antd";
import { put, takeEvery } from "redux-saga/effects";
import { AuthAPI } from "../../api/auth.api.js";
import {
  loginAction,
  loginActionFailed,
  loginActionSuccess,
  registerAction,
  registerActionFailed,
  registerActionSuccess,
} from "../slices/user.slice.js";

function* login(action) {
  try {
    const loginPayload = action.payload;
    const response = yield AuthAPI.login({
      email: loginPayload.email,
      password: loginPayload.password,
    });
    yield put(loginActionSuccess(response.data.user));
  } catch (error) {
    yield put(loginActionFailed(error.response.data));
  }
}
function* register(action) {
  try {
    const registerPayload = action.payload;
    const response = yield AuthAPI.register({
      id: registerPayload.id,
      role: registerPayload.role,
      email: registerPayload.email,
      password: registerPayload.password,
      firstName: registerPayload.firstName,
      lastName: registerPayload.lastName,
      phone: registerPayload.phone,
    });

    yield put(registerActionSuccess(response.data.user));
  } catch (error) {
    yield put(registerActionFailed(error.response.data));
  }
}

export function* userSaga() {
  yield takeEvery(loginAction, login);
  yield takeEvery(registerAction, register);
}

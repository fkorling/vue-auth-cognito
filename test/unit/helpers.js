import test from 'tape';
import proxyquire from 'proxyquire';
import * as sinon from 'sinon';

import fakeCognitoConfig from './config';

export function createModule() {
  const CognitoUserPool = sinon.stub();
  const AuthenticationDetails = sinon.stub();
  const UserAttribute = sinon.stub();
  const CognitoUser = sinon.stub();

  // Create our module
  const module = proxyquire('../../src/actions', {
    'amazon-cognito-identity-js': {
      CognitoUserPool,
      CognitoUser,
      AuthenticationDetails,
      UserAttribute,
    },
  }).default(fakeCognitoConfig); // call the default exported function with config

  // fixture for user details
  const userInfo = {
    username: 'test',
    password: 'Qwerty123!',
    attributes: [
      new UserAttribute({ Name: 'email', Value: 'test@email' }),
      new UserAttribute({ Name: 'name', Value: 'Richard' }),
      new UserAttribute({ Name: 'phone_number', Value: '+1555234567' }),
    ],
  };

  const currentUser = {
    getSession: sinon.stub(),
    getUsername: sinon.stub().returns('testusername'),
  };

  // Some required methods
  const getCurrentUser = CognitoUserPool.prototype.getCurrentUser = sinon.stub().returns(currentUser);

  return {
    module,
    fake: {
      CognitoUserPool,
      CognitoUser,
      AuthenticationDetails,
      UserAttribute,
      commit: sinon.stub(),
    },
    methods: {
      CognitoUserPool: {
        getCurrentUser,
      },
    },
    mock: {
      userInfo,
      currentUser,
    },
  };
}

// Some helpers for tests
const idTokenMethods = { getJwtToken: sinon.stub().returns('id') };
const accessTokenMethods = { getJwtToken: sinon.stub().returns('access') };
const refreshTokenMethods = { getToken: sinon.stub().returns('refresh') };

export function createSessionStub() {
  idTokenMethods.getJwtToken.reset();
  accessTokenMethods.getJwtToken.reset();
  refreshTokenMethods.getToken.reset();

  return {
    getIdToken: sinon.stub().returns(idTokenMethods),
    getRefreshToken: sinon.stub().returns(refreshTokenMethods),
    getAccessToken: sinon.stub().returns(accessTokenMethods),
  };
}

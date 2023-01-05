import { gql } from '@apollo/client'

export const createBlankUserMutation = gql`
  mutation createBlankUser {
    createBlankUser
  }
`

export const createUserByEmailMutation = gql`
  mutation createUserByEmail($email: String!) {
    createUserByEmail(email: $email)
  }
`

export const getOrCreateUserByEmailMutation = gql`
  mutation getOrCreateUserByEmail(
             $hasSession: Boolean!,
             $signedOutId: String,
             $email: String!) {
    getOrCreateUserByEmail(hasSession: $hasSession,
                           signedOutId: $signedOutId,
                           email: $email)
  }
`

export const updateIFileCreatedByMutation = gql`
  mutation updateIFileCreatedBy(
             $id: String!,
             $userId: String!,
             $signedOutUserId: String!) {
    updateIFileCreatedBy(
      id: $id,
      userId: $userId,
      signedOutUserId: $signedOutUserId)
  }
`

import { getCookie, setCookie } from 'cookies-next'
import { getOrCreateUserByEmailMutation } from 'apollo/users'
import { getSession } from 'next-auth/react'

export class UsersService {

  signedInCookieName = 'signedInUserUq'
  signedOutCookieName = 'signedOutUserUq'

  // Code
  formatCreateBlankUser(json: JSON) {
    // console.log('formatCreateBlankUser: ' + JSON.stringify(json))

    const userRecord = json['createBlankUser']

    if (!userRecord) {
      return null
    }

    var user = {
      'id': userRecord
    }

    return user
  }

  formatUserById(json: JSON) {
    // console.log('formatUserById: ' + JSON.stringify(json))

    const userRecord = json['userById']

    if (!userRecord) {
      return null
    }

    var user = {
      'id': userRecord.id
    }

    return user
  }

  async getSignedInOrOutUserIdFromCookie(
    { req, res }) {

    const session = await getSession({req: req})

    if (session) {
      return this.getUserIdFromCookie({req: req, res: res})
    } else {
      return this.getSignedOutUserIdFromCookie({req: req, res: res})
    }
  }

  getSignedOutUserIdFromCookie({ req, res }) {

    const signedOutIdValue =
            getCookie(this.signedOutCookieName,
            { req, res })

    // console.log(`getSignedOutUserIdFromCookie(): signedOutIdValue: ${signedOutIdValue}`)

    var id

    if (signedOutIdValue === undefined) {
      return null
    } else {
      id = signedOutIdValue
      return id
    }
  }

  getUserIdFromCookie({ req, res }) {

    const idValue =
            getCookie(
              this.signedInCookieName,
              { req, res })

    // console.log(`getUserIdFromCookie: idValue: ${idValue}`)

    var id

    if (idValue === undefined) {
      return null
    } else {
      id = idValue
      return id
    }
  }

  async getOrCreateUser(
          { req, res },
          session,
          apolloClient) {

    // Cookie values
    var signedInId: string = ''
    var signedOutId: string = ''

    if (session) {
      signedInId = this.getUserIdFromCookie({ req, res })
    } else {
      signedOutId = this.getSignedOutUserIdFromCookie({ req, res })
    }

    // Signed-out get/create user
    const originalSignedOutId = signedOutId

    if (session) {

      // console.log(`getOrCreateUser(): hasSession: ${!!session} email: ${session.user.email}`)

      // GraphQL get or create user
      var results: any = null

      await apolloClient.mutate({
        mutation: getOrCreateUserByEmailMutation,
        variables: {
          hasSession: !!session,     // true if defined
          signedOutId: signedOutId,
          email: session.user.email
        }
      }).then(result => results = result)
        .catch(error => {
          console.log(`error.networkError: ${JSON.stringify(error.networkError)}`)
        })

      // console.log(`results: ${JSON.stringify(results)}`)

      const newSignedInId = results.data['getOrCreateUserByEmail']

      // Update with newly created userProfile record
      if (signedInId !== newSignedInId) {
          signedInId = newSignedInId

        // console.log('getOrCreateUser: calling setSignedInUserCookie..')
        this.setSignedInUserCookie({req, res}, newSignedInId)
      }

      // Return
      return signedInId
    }

    // If not signed-in/out user cookie
    if (originalSignedOutId !== signedOutId) {
      this.setSignedOutUserCookie({req, res}, signedOutId)
    }

    // Return
    // console.log('returning signed-out user id: ' + signedOutId)

    return signedOutId
  }

  setSignedInUserCookie({ req, res }, id: string) {

    // Set userUq in cookie
    setCookie(
      this.signedInCookieName,
      id,
      { req,
        res,
        maxAge: 60 * 60 * 24 * 30 }) // 30 days
  }

  setSignedOutUserCookie({ req, res }, id: string) {

    // Set signedOutUserUq in cookie
    setCookie(
      this.signedOutCookieName,
      id,
      { req,
        res,
        maxAge: 60 * 60 * 24 * 30 }) // 30 days
  }
}

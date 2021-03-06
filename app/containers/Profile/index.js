/*
 *
 * Profile
 *
 */

import React, { PropTypes }                 from 'react';
import { connect }                          from 'react-redux';
import Helmet                               from 'react-helmet';
import { createStructuredSelector }         from 'reselect';
import makeSelectProfile                    from './selectors';
import * as firebase                        from 'firebase';
import { browserHistory }                   from 'react-router';
import DataChild                            from './dataChilds.js';
import { Spinner, SpinnerSize }             from 'office-ui-fabric-react/lib/Spinner';
import { SearchBox }                        from 'office-ui-fabric-react/lib/SearchBox';
import { DefaultButton, IButtonProps }      from 'office-ui-fabric-react/lib/Button';
import { Panel, PanelType }                 from 'office-ui-fabric-react/lib/Panel';
import { TextField }                        from 'office-ui-fabric-react/lib/TextField';
import { Toggle }                           from 'office-ui-fabric-react/lib/Toggle';
import "./profile.css"

export class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      msnsets: [],
      keyMatches: [],
      loading: true,
      uid: '',
      newEmail: '',
      password: '',
      passwordRepeat: '',
      showChangePW: false,
      showChangeEmail: false,
      showUploadPanel: false,
      showErrorPanel: false,
      responseMessage: "",
    }
  }

  componentDidMount(){
    var msnsets = [];
    firebase.database().ref('meta').on("child_added", (snapshot) => {
          let set = snapshot.val();
          msnsets.push({
            id          : snapshot.getKey(),
            description : set.Description,
            author      : set.author,
            contact     : set.contact,
            email       : set.email,
            lab         : set.lab,
            operator    : set.operator,
            species     : set.species,
            tissue      : set.tissue,
            title       : set.title,
            varName     : set.varName,
            UID         : set.UID,
            public      : set.public
          })

          this.setState({
            msnsets : msnsets,
            loading: false,
          })
    })
  };

  resetPassword(){
    if(this.state.password == this.state.passwordRepeat){
      let user = firebase.auth().currentUser;
      let newPassword = this.state.password;
      user.updatePassword(newPassword).then(() => {
        console.log("success");
        this.setState({showChangePW: false});
      }).catch((error) => {
        this.setState({showErrorPanel: true, responseMessage : error.message})
    });
    }
  };

  changeEmail(){
    let newEmail = this.state.newEmail;
    let user = firebase.auth().currentUser;
    user.updateEmail(newEmail).then(function() {
      console.log("success");
    }).catch((error) => {
      this.setState({showErrorPanel: true, responseMessage : error.message})
    });
  };

  render() {
    var user = firebase.auth().currentUser;
    if (user != null) {
       var email = user.email;
       var uid   = user.uid;
       var name  = user.displayName;
    } else {
       var email = "not logged in";
       var uid   = "not logged in";
       var name  = "not logged in";
    }

    const DataSetItem = this.state.msnsets.map((detail) =>
      <DataChild key={'dataChild'+detail.id} item={detail} uid={uid} />
    );

    const loader =  <div className="loader">
                      <Spinner size={SpinnerSize.large} />
                    </div>;

    const flexTiles = <div> {DataSetItem} </div>;
    const itemContainer = this.state.loading == true ? loader : flexTiles;
    const keyContainer = <div> works </div>;

    return (

      <div>
        <Helmet
          title="Profile"
          meta={[
            { name: 'description', content: 'Description of Profile' },
          ]}
        />

      <div className="container">
         <Panel
            isOpen               = {this.state.showChangeEmail}
            type                 = {PanelType.smallFixedFar}
            isLightDismiss       = {true}
            headerText           = 'Change Email'
            closeButtonAriaLabel = 'Close'
            >
             <TextField
               label='New Email:'
               onChanged={(input) => this.setState({newEmail: input})}
              />
              <DefaultButton
               text='Submit & Change'
               onClick={() => this.changeEmail()}
              />
              <p>{this.state.responseMessage}</p>
          </Panel>

          <Panel
            isOpen               = {this.state.showUploadPanel}
            type                 = {PanelType.mediumFixedNear}
            isLightDismiss       = {true}
            headerText           = 'Upload Instructions'
            closeButtonAriaLabel = 'Close'
            >
            Currently all uploads are handled via R and SpatialMapsData. You can use your SpatialMaps login within R to upload public or private datasets.
            <br/><br/>
            library(SpatialMapsData)
            upload(yourDataSet, login())
            <br/><br/>
            Find more information in our References.
          </Panel>

          <Panel
            isOpen               = {this.state.showChangePW}
            type                 = {PanelType.smallFixedFar}
            isLightDismiss       = {true}
            headerText           = 'Change Password'
            closeButtonAriaLabel = 'Close'
            >
            <TextField
             type       = "password"
             label      = 'New Password:'
             onChanged  = {(input) => this.setState({password: input})}
            />
            <TextField
             type       = "password"
             label      = 'Repeat Password:'
             onChanged  = {(input) => this.setState({passwordRepeat: input})}
            />
            <DefaultButton
             text       = 'Submit & Change'
             checked    = {this.state.password == this.state.passwordRepeat}
             onClick     = {() => this.resetPassword()}
            />
            <p>{this.state.responseMessage}</p>
          </Panel>

          <div className="profileData">
            <DefaultButton
              disabled  = {true}
              text      = {email}
            />
            <DefaultButton
              text      = 'Change Email'
              onClick   = {() => this.setState({showChangeEmail: true, showChangePW: false, showUploadPanel: false, responseMessage: ""})}
            />
            <DefaultButton
              text      = 'Change Password'
              onClick   = {() => this.setState({showChangePW: true, showChangeEmail: false, showUploadPanel: false, responseMessage: ""})}
            />
            <DefaultButton
              className = "buttonRightSide"
              text      ='Upload Dataset'
              onClick   = {() => this.setState({showUploadPanel: true, showChangeEmail: false, showChangePW: false, responseMessage: ""})}
            />
          </div>
          <div className="myData">
            {itemContainer}
          </div>
        </div>
      </div>
    );
  }
}

Profile.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  Profile: makeSelectProfile(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);

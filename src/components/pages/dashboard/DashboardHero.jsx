import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage as Msg } from 'react-intl';

import Button from '../../../common/misc/Button';
import PropTypes from '../../../utils/PropTypes';

import DashboardMenu from './DashboardMenu';

const mapStateToProps = state => ({
    user: state.get('user'),
    campaignList: state.getIn(['campaigns', 'campaignList']),
});

@connect(mapStateToProps)
export default class DashboardHero extends React.Component {

    render() {
        let userData = this.props.user.get('data');
        let firstName = userData.get('first_name');
        let campaigns = this.props.campaignList.get('items');
        let campaignCount;

        if(campaigns && campaigns.size > 0 ) {
            campaignCount = campaigns.size;
        }
        else {
            campaignCount= 0;
        }

        let greeting = (
            <div className="DashboardHero-greeting">
                <Msg tagName="h1" id="pages.dashboardPage.greeting.title"
                    values={{ name: firstName }}/>
                <Msg tagName="p" id="pages.dashboardPage.greeting.p"
                    values={{ count: campaignCount }}/>
                <Button key="toSignUpButton"
                    labelMsg="pages.dashboardPage.greeting.buttonLabel"
                    href="/dashboard/campaign"
                    onClick={ this.props.onClickSignUp }
                    />
            </div>
        );

        return (
            <div className="DashboardHero">
                { greeting }
                <DashboardMenu key="DashboardMenu"
                    selectedSection={ this.props.selectedSection }
                    />
            </div>
        );
    }
}

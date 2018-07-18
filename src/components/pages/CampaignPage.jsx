import immutable from 'immutable';
import React from 'react';
import { FormattedMessage as Msg } from 'react-intl';
import { connect } from 'react-redux';

import Button from '../../common/misc/Button';
import LoadingIndicator from '../../common/misc/LoadingIndicator';
import CampaignForm from '../../common/campaignForm/CampaignForm';
import { campaign } from '../../store/campaigns';
import { campaignActionList } from '../../store/actions';
import { organization } from '../../store/orgs';
import { retrieveCampaign } from '../../actions/campaign';
import {
    retrieveCampaignActions,
    updateActionResponse,
    retrieveUserResponses,
    retrieveUserActions,
} from '../../actions/action';


const mapStateToProps = (state, props) => {
    let c = campaign(state, props.params.campaignId);
    let o = c? organization(state, c.get('org_id')) : null;

    return {
        campaign: c,
        organization: o,
        userData: state.getIn(['user', 'data']),
        actionList: campaignActionList(state, props.params.campaignId),
        responseList: state.getIn(['actions', 'responseList']),
        userActionList: state.getIn(['actions', 'userActionList']),
    };
}

@connect(mapStateToProps)
export default class CampaignPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedActionId: null,
        };
    }

    componentDidMount() {
        let orgId = this.props.params.orgId;
        let campaignId = this.props.params.campaignId;

        this.props.dispatch(retrieveCampaignActions(orgId, campaignId));

        if (!this.props.campaign) {
            this.props.dispatch(retrieveCampaign(orgId, campaignId));
        }

        if (this.props.userData) {
            if (!this.props.userActionList.get('items')) {
                this.props.dispatch(retrieveUserActions());
            }

            if (!this.props.responseList.get('items')) {
                this.props.dispatch(retrieveUserResponses());
            }
        }
    }

    render() {
        let campaign = this.props.campaign;
        let campaignInfo;
        let form = null;

        if (campaign && campaign.get('isPending')) {
            campaignInfo = <LoadingIndicator />;
        }
        else if (!campaign || campaign.get('error')) {
            campaignInfo = <Msg id="pages.campaign.notFound.h"/>;
        }
        else if (campaign) {
            campaignInfo = [
                <h2 key="title">{ campaign.get('title') }</h2>,
                <span key="org" className="CampaignPage-infoOrg">
                    { this.props.organization.get('title') }
                </span>,
                <p key="infoText">
                    { campaign.get('info_text') }
                </p>
            ];

            const responseList = this.props.userData?
                this.props.responseList : immutable.fromJS({ items: [] });

            const userActionList = this.props.userData?
                this.props.userActionList : immutable.fromJS({ items: [] });

            form = (
                <CampaignForm
                    redirPath={ this.props.location.pathname }
                    // TODO: Don't use full action list
                    actionList={ this.props.actionList }
                    responseList={ responseList }
                    userActionList={ userActionList }
                    onResponse={ this.onResponse.bind(this) }/>
            );
        }

        let interstitial = null;
        if (this.state.selectedActionId) {
            interstitial = (
                <SignUpInterstitial
                    basePath={ this.props.location.pathname }
                    orgId={ campaign.get('org_id') }
                    actionId={ this.state.selectedActionId }
                    />
            );
        }

        return (
            <div className="CampaignPage">
                <div className="CampaignPage-info">
                    { campaignInfo }
                </div>
                { interstitial }
                { form }
            </div>
        );
    }

    onResponse(action, checked) {
        if (this.props.userData) {
            this.props.dispatch(updateActionResponse(action, checked));
        }
        else {
            this.setState({
                selectedActionId: action.get('id'),
            });
        }
    }
}

const SignUpInterstitial = props => {
    const signUpHref = '/ops/actionSignup/'
        + props.orgId
        + ',' + props.actionId
        + ',signup'
        + '?onComplete=' + encodeURIComponent(props.basePath);

    return (
        <div className="CampaignPage-interstitial">
            <div className="CampaignPage-interstitialContent">
                <div className="CampaignPage-interstitialIntro">
                    <Msg tagName="h1"
                        id="pages.campaign.interstitial.intro.h"
                        />
                    <Msg tagName="p"
                        id="pages.campaign.interstitial.intro.p"
                        />
                </div>
                <div className="CampaignPage-interstitialRegister">
                    <Msg tagName="p"
                        id="pages.campaign.interstitial.register.p"
                        />
                    <Button labelMsg="pages.campaign.interstitial.register.button"
                        href="/register"
                        />
                </div>
                <div className="CampaignPage-interstitialLogin">
                    <Msg tagName="p"
                        id="pages.campaign.interstitial.login.p"
                        />
                    <Button labelMsg="pages.campaign.interstitial.login.button"
                        href={ signUpHref } forceRefresh={ true }
                        />
                </div>
            </div>
        </div>
    );
};

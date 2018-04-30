import React from 'react';
import { FormattedMessage as Msg } from 'react-intl';

import Link from '../../../common/misc/FormattedLink';
import LoadingIndicator from '../../../common/misc/LoadingIndicator';


export default class OrgPageActions extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            maxVisible: 4,
        };
    }

    render() {
        let actionList = this.props.actionList;
        console.log(actionList);

        if (actionList.get('isPending')) {
            return <LoadingIndicator/>
        }
        else if (actionList.get('error')) {
            // TODO: Proper error message
            return <span>ERROR!</span>;
        }
        else if (actionList.get('items')
                && actionList.get('items').size > 0) {
            let moreLink;
            let maxVisible = this.state.maxVisible;
            let actions = actionList.get('items');

            if (maxVisible && actions.size > maxVisible) {
                let numExtra = actions.size - maxVisible;
                actions = actions.slice(0, maxVisible);

                moreLink = (
                    <Link msgId="dashboard.more"
                        msgValues={{ numExtra }}
                        onClick={ this.onClickMore.bind(this) }/>
                );
            }

            return (
                <div className="OrgPageActions">
                    <ul>
                    { actions.toList().map(item => (
                        <ActionListItem key={ item.get('id') }
                            action={ item }/>
                    ))}
                    </ul>
                    { moreLink }
                </div>
            );
        }
        else {
            return (
                <div className="OrgPageActions">
                    <Msg tagName="i" id="dashboard.events.none"/>
                </div>
            );
        }
    }

    onClickMore(ev) {
        this.setState({
            maxVisible: undefined,
        });
    }
}

const ActionListItem = props => {
    let action = props.action;
    let activity = action.getIn(['activity', 'title']);
    let startTime = Date.create(action.get('start_time'),
        { fromUTC: true, setUTC: true });

    return (
        <li className="ActionListItem">
            <span className="ActionListItem-dateTime">
                { startTime.format('{d}/{M} {HH}:{mm}') }</span>
            <span className="ActionListItem-activity">{ activity }</span>
        </li>
    );
};

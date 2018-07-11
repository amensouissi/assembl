// @flow
// eslint-disable
import React from 'react';
import { Translate } from 'react-redux-i18n';
import { Button } from 'react-bootstrap';
import classnames from 'classnames';
import CookieToggle from './cookieToggle';
import type { CookieObject } from './cookieToggle';

type CookiesSelectorProps = {};

type CookiesSelectorState = {
  activeKey: ?string,
  show: boolean,
  cookies: Object
};


class CookiesSelector extends React.Component<CookiesSelectorProps, CookiesSelectorState> {
  constructor(props: CookiesSelectorProps) {
    super(props);
    const cookiesList = 'assembl_session=1234; _LOCALE_=fr; _pk_id.abcd1234=1234;'.split(' ');
    const cookiesArray = cookiesList.map(cookie => ({ ...this.getCookieObject(cookie), accepted: true }));
    const cookiesByCategory = this.getCookiesObjectFromArray(cookiesArray);
    this.state = {
      activeKey: 'essential',
      show: true,
      cookies: cookiesByCategory
    };
  }

  getCookieObject = (cookie: string) => {
    if (cookie.startsWith('assembl_session')) {
      return { category: 'essential', name: 'userSession' };
    }
    if (cookie.startsWith('_LOCALE_')) {
      return { category: 'essential', name: 'locale' };
    }
    if (cookie.startsWith('_pk_')) {
      return { category: 'analytics', name: 'piwik' };
    }
    return { category: 'other', name: cookie };
  };

  getCookiesObjectFromArray = (cookiesArray: Array<CookieObject>) => {
    const cookiesObject = {};
    cookiesArray.forEach(function(cookie) { // eslint-disable-line
      const { category } = cookie;
      if (cookiesObject[category]) {
        cookiesObject[category] = [...cookiesObject[category], cookie];
      } else {
        cookiesObject[category] = [cookie];
      }
    });
    return cookiesObject;
  }

  handleToggle = (updatedCookie: CookieObject) => {
    const { cookies } = this.state;
    const cookiesArray = Object.values(cookies).reduce((flat, next) => flat.concat(next), []);
    const updatedCookiesArray = cookiesArray.map(cookie => (cookie.name === updatedCookie.name ? updatedCookie : cookie));
    const updatedCookiesByCategory = this.getCookiesObjectFromArray(updatedCookiesArray);
    this.setState({ cookies: updatedCookiesByCategory });
  }

  saveChanges = () => {
    // saves the new cookies settings stored in localstate in the backend
  }

  render() {
    const { activeKey, show, cookies } = this.state;
    return (
      <div className="cookies-selector page-body">
        {Object.keys(cookies).map((category) => {
          const isActiveKey = category === activeKey;
          return (
            <div key={`category-${category}`}>
              <div
                className="cookies-category-selector"
                onClick={() => {
                  this.setState({ activeKey: category, show: !show });
                  return category !== activeKey && this.setState({ show: true });
                }}
              >
                <span className={classnames('assembl-icon-right-dir', { 'active-arrow': isActiveKey })} />
                <Translate value={`cookiesPolicy.${category}`} className="dark-title-4" />
              </div>
              <div className="cookies-toggles">
                {isActiveKey && show &&
              cookies[category].map(cookie => (
                <CookieToggle
                  cookie={cookie}
                  key={cookie.name}
                  handleToggle={this.handleToggle}
                />
              ))}
              </div>
            </div>
          );
        }) }
        <Button onClick={this.saveChanges} className="button-submit button-dark">
          <Translate value="profile.save" />
        </Button>
      </div>);
  }
}

export default CookiesSelector;
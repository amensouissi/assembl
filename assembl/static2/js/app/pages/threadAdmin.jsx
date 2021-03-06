import React from 'react';
import { compose, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import { get } from '../utils/routeMap';
import { PHASES } from '../constants';
import ExportSection from '../components/administration/exportSection';
import Navbar from '../components/administration/navbar';
import DiscussionPreferenceLanguageQuery from '../graphql/DiscussionPreferenceLanguage.graphql';

class ThreadAdmin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      exportLocale: null,
      refetching: false,
      translate: false,
      isAnonymous: false
    };
  }

  componentDidMount() {
    this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave);
  }

  componentWillUnmount() {
    this.props.router.setRouteLeaveHook(this.props.route, null);
  }

  handleExportLocaleChange = (locale) => {
    this.setState({ exportLocale: locale });
  };

  handleTranslationChange = (shouldTranslate) => {
    this.setState({ translate: shouldTranslate });
  };

  handleAnonymousChange = () => {
    this.setState(prevState => ({ isAnonymous: !prevState.isAnonymous }));
  };

  render() {
    const { section, languages, debateId } = this.props;
    const { translate } = this.state;
    const exportLocale = this.state.exportLocale || (languages && languages[0].locale);
    const translation = translate && exportLocale ? `?lang=${exportLocale}` : '?'; // FIXME: using '' instead of '?' does not work
    const { isAnonymous } = this.state;
    const anonymous = translation === '?' ? `anon=${isAnonymous.toString()}` : `&anon=${isAnonymous.toString()}`;
    const exportLink = get('exportThreadMulticolumnData', { debateId: debateId, translation: translation, anonymous: anonymous });
    return (
      <div className="thread-admin">
        {section === '1' && (
          // When the other sections of this admin will be added, this one will be the last section and not '1'
          <ExportSection
            withLanguageOptions
            handleExportLocaleChange={this.handleExportLocaleChange}
            handleTranslationChange={this.handleTranslationChange}
            handleAnonymousChange={this.handleAnonymousChange}
            exportLink={exportLink}
            translate={translate}
            exportLocale={exportLocale}
            languages={languages}
            annotation="threadAnnotation"
          />
        )}
        {section && <Navbar currentStep={section} steps={['1']} phaseIdentifier={PHASES.thread} />}
      </div>
    );
  }
}

const mapStateToProps = ({ context, i18n }) => ({
  debateId: context.debateId,
  i18n: i18n
});

export default compose(
  connect(mapStateToProps),
  graphql(DiscussionPreferenceLanguageQuery, {
    options: ({ i18n: { locale } }) => ({
      variables: {
        inLocale: locale
      }
    }),
    props: ({ data }) => {
      if (data.error || data.loading) {
        return {
          error: data.error,
          loading: data.loading
        };
      }

      return {
        error: data.error,
        loading: data.loading,
        languages: data.discussionPreferences.languages
      };
    }
  })
)(ThreadAdmin);
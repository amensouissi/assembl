// @flow
import React from 'react';
import { connect } from 'react-redux';
import { I18n } from 'react-redux-i18n';
import { Field } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { type ApolloClient, compose, withApollo } from 'react-apollo';
import LoadSaveReinitializeForm from '../../form/LoadSaveReinitializeForm';
import MultilingualRichTextFieldAdapter from '../../form/multilingualRichTextFieldAdapter';
import { load, postLoadFormat } from './load';
import Loader from '../../common/loader';
import validate from './validate';
import { save, createMutationsPromises } from './save';
import AdminForm from '../../../components/form/adminForm';

const loading = <Loader />;

type LegalContentsFormProps = {
  client: ApolloClient,
  editLocale: string,
  locale: string
};

const DumbLegalContentsForm = ({ client, editLocale, locale }: LegalContentsFormProps) => {
  const legalNoticeLabel = I18n.t('administration.legalContents.legalNoticeLabel');
  const tacLabel = I18n.t('administration.legalContents.termsAndConditionsLabel');
  const cookiesPolicyLabel = I18n.t('administration.legalContents.cookiesPolicyLabel');
  const privacyPolicyLabel = I18n.t('administration.legalContents.privacyPolicyLabel');
  const userGuidelinesLabel = I18n.t('administration.legalContents.userGuidelinesLabel');

  return (
    <LoadSaveReinitializeForm
      load={(fetchPolicy: FetchPolicy) => load(client, fetchPolicy, locale)}
      loading={loading}
      postLoadFormat={postLoadFormat}
      createMutationsPromises={createMutationsPromises(client, locale)}
      save={save}
      validate={validate}
      mutators={{
        ...arrayMutators
      }}
      render={({ handleSubmit, pristine, submitting }) => (
        <div className="admin-content">
          <AdminForm handleSubmit={handleSubmit} pristine={pristine} submitting={submitting}>
            <div className="form-container">
              <Field
                key={`tac-${editLocale}`}
                editLocale={editLocale}
                name="termsAndConditions"
                component={MultilingualRichTextFieldAdapter}
                label={tacLabel}
              />
              <Field
                key={`legal-notice-${editLocale}`}
                editLocale={editLocale}
                name="legalNotice"
                component={MultilingualRichTextFieldAdapter}
                label={legalNoticeLabel}
              />
              <Field
                key={`cookie-policy-${editLocale}`}
                editLocale={editLocale}
                name="cookiesPolicy"
                component={MultilingualRichTextFieldAdapter}
                label={cookiesPolicyLabel}
              />
              <Field
                key={`privacy-policy-${editLocale}`}
                editLocale={editLocale}
                name="privacyPolicy"
                component={MultilingualRichTextFieldAdapter}
                label={privacyPolicyLabel}
              />
              <Field
                key={`user-guidelines-${editLocale}`}
                editLocale={editLocale}
                name="userGuidelines"
                component={MultilingualRichTextFieldAdapter}
                label={userGuidelinesLabel}
              />
            </div>
          </AdminForm>
        </div>
      )}
    />
  );
};

const mapStateToProps = state => ({
  editLocale: state.admin.editLocale,
  locale: state.i18n.locale
});

export default compose(connect(mapStateToProps), withApollo)(DumbLegalContentsForm);
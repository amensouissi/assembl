// @flow
import React from 'react';
import { connect } from 'react-redux';
import { I18n } from 'react-redux-i18n';
import arrayMutators from 'final-form-arrays';
import { type ApolloClient, compose, withApollo } from 'react-apollo';
import { Field } from 'react-final-form';

import FieldArrayWithActions from '../../form/fieldArrayWithActions';
import FileUploaderFieldAdapter from '../../form/fileUploaderFieldAdapter';
import MultilingualTextFieldAdapter from '../../form/multilingualTextFieldAdapter';
import MultilingualRichTextFieldAdapter from '../../form/multilingualRichTextFieldAdapter';
import TextFieldAdapter from '../../form/textFieldAdapter';
import { createResourceTooltip, deleteResourceTooltip } from '../../common/tooltips';

import LoadSaveReinitializeForm from '../../../components/form/LoadSaveReinitializeForm';
import { load, postLoadFormat } from './load';
import { createMutationsPromises, save } from './save';
import validate from './validate';
import Loader from '../../common/loader';
import { convertEntriesToHTML } from '../../../utils/draftjs';
import { displayAlert } from '../../../utils/utilityManager';
import SaveButton, { getMutationsPromises, runSerial } from '../../../components/administration/saveButton';

const createVariablesForResourceMutation = resource => ({
  doc: resource.doc && typeof resource.doc.externalUrl === 'object' ? resource.doc.externalUrl : null,
  embedCode: resource.embedCode,
  image: resource.img && typeof resource.img.externalUrl === 'object' ? resource.img.externalUrl : null,
  textEntries: convertEntriesToHTML(resource.textEntries),
  titleEntries: resource.titleEntries
});

const createVariablesForDeleteResourceMutation = resource => ({ resourceId: resource.id });

type Props = {
  client: ApolloClient,
  editLocale: string,
  pageHasChanged: boolean,
  resourcesHaveChanged: boolean,
  resources: Array<Object>,
  resourcesCenterPage: Object,
  createResource: Function,
  deleteResource: Function,
  updateResource: Function,
  updateResourcesCenter: Function,
  refetchTabsConditions: Function,
  refetchResources: Function,
  refetchResourcesCenter: Function
};

type State = {
  refetching: boolean
};

const loading = <Loader />;

class ResourcesCenterAdminForm extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {
      refetching: false
    };
  }

  // componentDidMount() {
  //   this.props.router.setRouteLeaveHook(this.props.route, this.routerWillLeave);
  // }

  // componentWillUnmount() {
  //   this.props.router.setRouteLeaveHook(this.props.route, null);
  // }

  // routerWillLeave = () => {
  //   if (this.dataHaveChanged() && !this.state.refetching) {
  //     return I18n.t('administration.confirmUnsavedChanges');
  //   }

  //   return null;
  // };

  dataHaveChanged = () => this.props.pageHasChanged || this.props.resourcesHaveChanged;

  saveAction = () => {
    const {
      pageHasChanged,
      resourcesHaveChanged,
      resources,
      resourcesCenterPage,
      createResource,
      deleteResource,
      updateResource,
      updateResourcesCenter,
      refetchTabsConditions,
      refetchResources,
      refetchResourcesCenter
    } = this.props;
    displayAlert('success', `${I18n.t('loading.wait')}...`);
    if (pageHasChanged) {
      const pageHeaderImage = resourcesCenterPage.get('headerImage').toJS();
      const headerImage = typeof pageHeaderImage.externalUrl === 'object' ? pageHeaderImage.externalUrl : null;
      const payload = {
        variables: {
          headerImage: headerImage,
          titleEntries: resourcesCenterPage.get('titleEntries').toJS()
        }
      };
      updateResourcesCenter(payload)
        .then(() => {
          this.setState({ refetching: true });
          refetchResourcesCenter().then(() => this.setState({ refetching: false }));
          displayAlert('success', I18n.t('administration.resourcesCenter.successSave'));
        })
        .catch((error) => {
          displayAlert('danger', `${error}`, false, 30000);
        });
    }

    if (resourcesHaveChanged) {
      const mutationsPromises = getMutationsPromises({
        items: resources,
        variablesCreator: createVariablesForResourceMutation,
        deleteVariablesCreator: createVariablesForDeleteResourceMutation,
        createMutation: createResource,
        deleteMutation: deleteResource,
        updateMutation: updateResource
      });

      runSerial(mutationsPromises)
        .then(() => {
          this.setState({ refetching: true });
          refetchTabsConditions().then(() => refetchResources().then(() => this.setState({ refetching: false })));

          displayAlert('success', I18n.t('administration.resourcesCenter.successSave'));
        })
        .catch((error) => {
          displayAlert('danger', `${error}`, false, 30000);
        });
    }
  };

  render() {
    const { editLocale, client } = this.props;
    return (
      <LoadSaveReinitializeForm
        load={(fetchPolicy: FetchPolicy) => load(client, fetchPolicy)}
        loading={loading}
        postLoadFormat={postLoadFormat}
        createMutationsPromises={createMutationsPromises(client)}
        save={save}
        validate={validate}
        mutators={{
          ...arrayMutators
        }}
        render={({ handleSubmit, pristine, submitting }) => (
          <div className="admin-content">
            <form onSubmit={handleSubmit}>
              <SaveButton disabled={pristine || submitting} saveAction={handleSubmit} />
              <div className="form-container">
                <Field
                  editLocale={editLocale}
                  name="pageTitle"
                  component={MultilingualTextFieldAdapter}
                  label={I18n.t('administration.resourcesCenter.pageTitleLabel')}
                  required
                />
                <Field
                  name="pageHeader"
                  component={FileUploaderFieldAdapter}
                  label={I18n.t('administration.resourcesCenter.imageLabel')}
                />
                <div className="separator" />
              </div>

              <FieldArrayWithActions
                name="resources"
                renderFields={({ name }) => (
                  <React.Fragment>
                    <Field
                      editLocale={editLocale}
                      name={`${name}.title`}
                      component={MultilingualTextFieldAdapter}
                      label={`${I18n.t('administration.resourcesCenter.titleLabel')} ${editLocale.toUpperCase()}`}
                      required
                    />
                    <Field
                      editLocale={editLocale}
                      name={`${name}.text`}
                      component={MultilingualRichTextFieldAdapter}
                      label={`${I18n.t('administration.resourcesCenter.textLabel')} ${editLocale.toUpperCase()}`}
                    />
                    <Field
                      componentClass="textarea"
                      name={`${name}.embedCode`}
                      component={TextFieldAdapter}
                      label={I18n.t('administration.resourcesCenter.embedCodeLabel')}
                    />
                    <Field
                      name={`${name}.img`}
                      component={FileUploaderFieldAdapter}
                      label={I18n.t('administration.resourcesCenter.imageLabel')}
                    />
                    <Field
                      name={`${name}.doc`}
                      component={FileUploaderFieldAdapter}
                      label={I18n.t('administration.resourcesCenter.documentLabel')}
                    />
                  </React.Fragment>
                )}
                titleMsgId="administration.resourcesCenter.editResourceFormTitle"
                tooltips={{
                  addTooltip: createResourceTooltip,
                  deleteTooltip: deleteResourceTooltip
                }}
              />
            </form>
          </div>
        )}
      />
    );
  }
}

const mapStateToProps = ({ admin: { editLocale, resourcesCenter } }) => {
  const { page, resourcesById, resourcesHaveChanged, resourcesInOrder } = resourcesCenter;
  return {
    editLocale: editLocale,
    pageHasChanged: page.get('_hasChanged'),
    resourcesCenterPage: page,
    resourcesHaveChanged: resourcesHaveChanged,
    resources: resourcesInOrder.map(id => resourcesById.get(id).toJS())
  };
};

export default compose(connect(mapStateToProps), withApollo)(ResourcesCenterAdminForm);
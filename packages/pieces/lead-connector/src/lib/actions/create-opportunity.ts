import { createAction, Property, Validators } from '@activepieces/pieces-framework';
import { createOpportunity, getContacts, getPipeline, getPipelines, getUsers, LeadConnectorOpportunityStatus } from '../common';
import { leadConnectorAuth } from '../..';

export const createOpportunityAction = createAction({
    auth: leadConnectorAuth,
    name: 'create_opportunity',
    displayName: 'Create Opportunity',
    description: 'Create a new opportunity.',
    props: {
        pipeline: Property.Dropdown({
            displayName: 'Pipeline',
            description: 'The ID of the pipeline to use.',
            required: true,
            refreshers: [],
            options: async ({ auth }) => {
                if (!auth) {
                    return {
                        disabled: true,
                        options: []
                    }
                }

                const pipelines = await getPipelines(auth as string);
                return {
                    options: pipelines.map((pipeline: any) => {
                        return {
                            label: pipeline.name,
                            value: pipeline.id
                        }
                    })
                }
            }
        }),
        stage: Property.Dropdown({
            displayName: 'Stage',
            description: 'The stage of the pipeline to use.',
            required: true,
            refreshers: ['pipeline'],
            options: async ({ auth, pipeline }) => {
                if (!auth) {
                    return {
                        disabled: true,
                        options: []
                    }
                }

                const pipelineObj = await getPipeline(auth as string, pipeline as string);
                return {
                    options: pipelineObj.stages.map((stage: any) => {
                        return {
                            label: stage.name,
                            value: stage.id
                        }
                    })
                }
            }
        }),
        title: Property.ShortText({
            displayName: 'Title',
            required: true
        }),
        contact: Property.Dropdown({
            displayName: 'Contact',
            description: 'The contact to use.',
            required: true,
            refreshers: [],
            options: async ({ auth }) => {
                if (!auth) return {
                    disabled: true,
                    options: []
                }

                const contacts = await getContacts(auth as string);
                return {
                    options: contacts.map(contact => {
                        return {
                            label: contact.contactName,
                            value: contact.id
                        }
                    })
                }
            }
        }),
        status: Property.Dropdown({
            displayName: 'Status',
            required: true,
            refreshers: [],
            options: async () => {
                const statuses = Object.values(LeadConnectorOpportunityStatus);

                return {
                    options: statuses.map((status => {
                        return {
                            label: status.charAt(0).toUpperCase() + status.slice(1),
                            value: status
                        }
                    }))
                }
            }
        }),
        assignedTo: Property.Dropdown({
            displayName: 'Assigned To',
            required: false,
            refreshers: [],
            options: async ({ auth }) => {
                if (!auth) return {
                    disabled: true,
                    options: []
                }

                const users = await getUsers(auth as string);
                return {
                    options: users.map((user: any) => {
                        return {
                            label: `${user.firstName} ${user.lastName}`,
                            value: user.id
                        }
                    })
                }
            }
        }),
        monetaryValue: Property.Number({
            displayName: 'Monetary Value',
            required: false,
            validators: [Validators.number]
        })
    },

    async run({ auth, propsValue }) {
        const { pipeline, stage, contact, status, title, assignedTo, monetaryValue } = propsValue;

        return await createOpportunity(auth, pipeline, {
            stageId: stage,
            contactId: contact,
            status: status,
            title: title,
            assignedTo: assignedTo,
            monetaryValue: monetaryValue
        });
    },
});

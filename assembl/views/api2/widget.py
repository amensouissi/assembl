from simplejson import loads

from pyramid.view import view_config
from pyramid.security import authenticated_userid

from assembl.auth import P_READ, P_ADMIN_DISC, Everyone
from assembl.models import Widget, User, Discussion, IdeaViewWidget
from assembl.auth.util import get_permissions
from ..traversal import InstanceContext


@view_config(context=InstanceContext, renderer='json', request_method='GET',
             ctx_instance_class=Widget, permission=P_READ,
             accept="application/json")
def collection_view(request):
    ctx = request.context
    view = (request.matchdict or {}).get('view', None)\
        or ctx.get_default_view() or 'default'
    json = ctx._instance.generic_json(view)
    user_id = authenticated_userid(request) or Everyone
    if user_id != Everyone:
        user = User.get(id=user_id)
        #json['discussion'] = ...
        json['user'] = user.generic_json(view_def_name=view)
        json['user_permissions'] = get_permissions(
            user_id, ctx._instance.get_discussion_id())
    return json


@view_config(
    context=InstanceContext, ctx_instance_class=IdeaViewWidget,
    request_method="GET", permission=P_READ,
    renderer="json", name="confirm_ideas")
def view_confirmed_ideas(request):
    ctx = request.context
    return ctx._instance.get_confirmed_ideas()


@view_config(
    context=InstanceContext, ctx_instance_class=IdeaViewWidget,
    request_method="POST", permission=P_ADMIN_DISC,
    renderer="json", name="confirm_ideas")
def set_confirmed_ideas(request):
    ids = loads(request.POST['ids'])
    ctx = request.context
    ctx._instance.set_confirmed_ideas(ids)
    return "Ok"


@view_config(
    context=InstanceContext, ctx_instance_class=IdeaViewWidget,
    request_method="GET", permission=P_READ,
    renderer="json", name="confirm_messages")
def view_confirmed_messages(request):
    ctx = request.context
    return ctx._instance.get_confirmed_messages()


@view_config(
    context=InstanceContext, ctx_instance_class=IdeaViewWidget,
    request_method="POST", permission=P_ADMIN_DISC,
    renderer="json", name="confirm_messages")
def set_confirmed_messages(request):
    ids = loads(request.POST['ids'])
    ctx = request.context
    ctx._instance.set_confirmed_messages(ids)
    return "Ok"

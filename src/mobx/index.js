import {flow, makeAutoObservable, makeObservable, observable, onBecomeObserved} from "mobx";
import api from "../shared/api";
import {observer} from "mobx-react-lite";
import {useEffect} from "react";
import User from "../shared/components/User";
import Posts from "../shared/components/Posts";
import NewPost from "../shared/components/NewPost";

class UserStore {
    name = '';
    id = null;

    constructor() {
        makeObservable(this, {
            name: observable,
            id: observable,
            fetch: flow.bound //action.bound - annotation can be used to automatically bind a method to the correct instance, so that this is always correctly bound inside the function
        })

        onBecomeObserved(this, 'name', this.fetch) //вместо useEffect
    }

    * fetch() {
        const response = yield api.getMe();
        this.name = response.name;
        this.id = response.id;
    }
}

class PostStore {
    id;
    title = '';
    text = '';
    authorId = -1;

    constructor({id, title, text, authorId}) {
        makeAutoObservable(this, {}, {
            autoBind: true
        })
        this.id = id;
        this.title = title;
        this.text = text;
        this.authorId = authorId
    }

    updateText(text){
        this.text = text;
    }
}

class PostsStore {
    list = []

    constructor() {
        makeAutoObservable(this, {}, {
            autoBind: true
        })
        onBecomeObserved(this, 'list', this.fetch)
    }

    // addPost(payload) {
    //     this.list.push(new PostsStore(payload));
    // }
    * addPost(payload) {
        yield api.addPost(payload);

        yield this.fetch();
    }

    * deletePost(id) {
        yield api.removePost(id);

        const postIndex = this.list.findIndex(p => p.id === id);
        this.list.splice(postIndex, 1);

    }

    * fetch() {
        const response = yield api.getPosts();

        this.list = response.map(post => new PostStore(post))
    }
}

const user = new UserStore();
const posts = new PostsStore();

const ObservablePosts = observer(Posts);

const MobxApp = observer(() => {
    const {id, name} = user;
    // useEffect(() => {
    //     users.fetch()
    // }, [])
    return (
        <>
            <User name={user.name}/>
            <NewPost onCreate={(postPayload) => {
                posts.addPost({
                    authorId: user.id,
                    ...postPayload,
                })
            }}/>
            <ObservablePosts
                data={posts.list}
                onRemove={id => {
                    posts.deletePost(id)
                }}
                onEdit = {(id,text) =>{
                    const post = posts.list.find(p=>p.id===id);

                    post.updateText(text);
                }

                }
            />
        </>

    )
})
export default function MobxWay() {
    return (
        <div>
            <MobxApp/>
        </div>
    )
}
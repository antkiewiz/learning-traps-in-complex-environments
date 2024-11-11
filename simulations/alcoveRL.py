import numpy as np

class AlcoveRL():
    def __init__(self, exemplars, params, full_info=False, constructivist_encoding=False, yoke_attention=False):
        self.exemplars = exemplars[:]
        # free parameters
        self.phi, self.C, self.learn_w, self.learn_a, self.optimism = params
        # fixed parameters
        self.full_info = full_info
        self.constructivist_encoding = constructivist_encoding

        ## Defining the network.

        # number of input, hidden, and output nodes
        self.ni = len( self.exemplars[0] )
        self.nh = len( self.exemplars  )
        self.no = 2

        # keep track of exemplar we're using at any given time.
        self.current_exemplar = []
        # denotes currently obscured dimensions
        self.mask = []
        # dimensions obscured during feedback
        self.feedback_mask = []
        # possible rewards of actions
        self.actionrewards = []

        # activations for nodes
        self.ah = np.ones(self.nh)
        self.ao = np.ones(self.no)

        self.yoke_attention = yoke_attention
        # attention to each stimulus dimension
        self.attention = np.ones(self.ni)
        self.attention /= sum(self.attention)

        #assume each dimension has same number of possible values!
        self.wi = np.ones((self.ni, self.nh))
        self.wo = np.ones((self.nh, self.no))
        # starting prediction of approach value set to optimism parameter
        self.wo[:,0] = self.optimism
        self.wo[:,1] = 0

        # Input -> Hidden weights set based on exemplars
        for j in range(self.nh):
            for i in range(self.ni):
                self.wi[i][j] = self.exemplars[j][i]

    def runtrial(self, exemplarnum, actionrewards, mask, feedback_mask, feedback=True):
        self.current_exemplar = self.exemplars[exemplarnum]
        self.mask = mask
        self.feedback_mask = feedback_mask
        self.actionrewards = actionrewards
        self.update()
        action, reward = self.make_action()
        if feedback:
            self.propogate_error()
        return action, reward

    def update(self):
        inputs = self.current_exemplar
        if len(inputs) != self.ni:
            raise ValueError('wrong number of inputs')
        # hidden activations
        # modified for vector stimulus representation ([1,0], [0,1]
        # instead of just 0 and 1).
        for j in range(self.nh):
            tot = 0.0
            for i in range(self.ni):
                dist = (self.wi[i][j] != inputs[i])
                if not self.mask[i]:
                    tot += self.attention[i] * dist
            self.ah[j] = np.exp( -self.C * tot )
        sum_similarity = sum(self.ah)
        for j in range(self.nh):
            self.ah[j] = self.ah[j]/sum_similarity
        # output activations
        for k in range(self.no):
            tot = 0.0
            for j in range(self.nh):
                tot = tot + self.ah[j] * self.wo[j][k]
            self.ao[k] = tot
            #self.ao[k] = sigmoid(sum)

    def propogate_error(self, teach_val = -1):
        output_deltas = np.zeros( self.no)

        if teach_val == -1:
            teach_val = self.determine_teach_val()
        output_deltas = teach_val - self.ao

        # calculate error terms for hidden units.
        hidden_deltas = np.zeros( self.nh )
        for j in range(self.nh):
            error = 0.0
            for k in range(self.no):
                error += output_deltas[k]*self.wo[j][k]
            hidden_deltas[j] = error

        # update output weights
        for j in range(self.nh):
            for k in range(self.no):
                change = output_deltas[k]*self.ah[j]
                self.wo[j][k] = self.wo[j][k] + self.learn_w * change

        # update attention weights
        hidden_errors = []
        for i in range(self.ni):
            hidden_errors.append(0)
            if not self.feedback_mask[i]:
                for j in range(self.nh):
                    hidden_errors[i] += hidden_deltas[j]*self.ah[j]* self.C * \
                                        (self.wi[i][j] != self.current_exemplar[i])
        for i in range(self.ni):
            if self.yoke_attention:
                self.attention[i] += -self.learn_a * sum(hidden_errors)
            else:
                self.attention[i] += -self.learn_a * hidden_errors[i]
            if self.attention[i] < 0:
                self.attention[i] = 0 # Don't let it get below 0.

        return output_deltas

    def make_action(self):
        # This is the Luce choice model.
        # Finds the probability of giving each response.
        # P(K) = exp( phi*akout) / sum of that over all.
        tot = 0
        for k in range(self.no):
            tot += np.exp( self.phi * (self.ao[k]) )
        probs = [ np.exp( self.phi*(self.ao[k]) )
                  / tot for k in range(self.no) ]
        self.action = np.random.multinomial(1, probs)
        # return whether took action 0 or 1, and reward
        return self.action[1], sum(np.multiply(self.action,
                                               self.actionrewards))

    def determine_teach_val(self):
        ret = []
        if self.full_info:
            return self.actionrewards
        if self.constructivist_encoding:
            if self.action[0]:
                ret.append(self.actionrewards[0])
                ret.append(self.ao[1])
                return ret
            else:
                ret.append(-.5)
                ret.append(self.actionrewards[1])
                return ret
        for k in range(self.no):
            if self.action[k]:
                ret.append(self.actionrewards[k])
            else:
                ret.append(self.ao[k])
        return ret
